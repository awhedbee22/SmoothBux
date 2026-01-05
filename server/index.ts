import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

app.use(cors());
app.use(express.json());

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Initialize LibSQL Client
const client = createClient({
    url: url || 'file:local.db', // Fallback for safety, though env is expected
    authToken: authToken,
});

console.log(`Connecting to Turso at ${url ? 'configured URL' : 'local file (fallback)'}...`);

// --- Auth Setup & Seeding ---
async function setupAuth() {
    try {
        // Create menu_items table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                ingredients TEXT,
                is_available BOOLEAN DEFAULT 1,
                category TEXT DEFAULT 'smoothie',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add category column if missing (for existing dbs)
        try {
            await client.execute("ALTER TABLE menu_items ADD COLUMN category TEXT DEFAULT 'smoothie'");
        } catch (e) {
            // Column likely exists, ignore
        }

        // Check if users exist
        const result = await client.execute('SELECT COUNT(*) as count FROM users');
        const count = result.rows[0].count as number;

        if (count === 0) {
            console.log('Seeding default users...');
            const managerPass = await bcrypt.hash('admin123', 10);
            const familyPass = await bcrypt.hash('family123', 10);

            await client.batch([
                {
                    sql: 'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
                    args: [crypto.randomUUID(), 'manager', managerPass, 'admin']
                },
                {
                    sql: 'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
                    args: [crypto.randomUUID(), 'family', familyPass, 'customer']
                }
            ], 'write');
            console.log('Default users seeded: manager/admin123, family/family123');
        }
    } catch (err) {
        console.error('Failed to setup auth:', err);
    }
}

setupAuth();

// --- Auth Routes ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await client.execute({
            sql: 'SELECT * FROM users WHERE username = ?',
            args: [username]
        });

        if (rows.length === 0) {
            // @ts-ignore
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash as string);

        if (!valid) {
            // @ts-ignore
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Verify Token Endpoint (Optional, for client init)
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // @ts-ignore
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded }); // decoded contains {id, username, role, ...}
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});


// --- API Routes ---

// Get Menu
app.get('/api/menu', async (req, res) => {
    try {
        const { rows } = await client.execute('SELECT * FROM menu_items ORDER BY created_at');
        // Parse JSON ingredients
        const formatted = rows.map(r => ({
            ...r,
            ingredients: r.ingredients ? JSON.parse(r.ingredients as string) : [],
            is_available: Boolean(r.is_available) // SQLite stores booleans as 0/1
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Add Item
app.post('/api/menu', async (req, res) => {
    const { name, description, image_url, ingredients, is_available, category } = req.body;
    const id = crypto.randomUUID();
    try {
        await client.execute({
            sql: 'INSERT INTO menu_items (id, name, description, image_url, ingredients, is_available, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, name, description, image_url, JSON.stringify(ingredients), is_available ? 1 : 0, category || 'smoothie']
        });

        // Fetch back to return
        const { rows } = await client.execute({ sql: 'SELECT * FROM menu_items WHERE id = ?', args: [id] });
        const item = rows[0];
        res.json({
            ...item,
            ingredients: item.ingredients ? JSON.parse(item.ingredients as string) : [],
            is_available: Boolean(item.is_available)
        });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Delete Item
app.delete('/api/menu/:id', async (req, res) => {
    try {
        await client.execute({ sql: 'DELETE FROM menu_items WHERE id = ?', args: [req.params.id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Toggle Availability
app.put('/api/menu/:id/toggle', async (req, res) => {
    const { is_available } = req.body;
    try {
        await client.execute({
            sql: 'UPDATE menu_items SET is_available = ? WHERE id = ?',
            args: [is_available ? 1 : 0, req.params.id]
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// --- Menu Options (Boosts/Juices) ---

// Get Options
app.get('/api/options', async (req, res) => {
    try {
        const { rows } = await client.execute('SELECT * FROM menu_options ORDER BY category, name');
        const formatted = rows.map(r => ({
            ...r,
            is_available: Boolean(r.is_available)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Add Option
app.post('/api/options', async (req, res) => {
    const { name, category } = req.body;
    const id = crypto.randomUUID();
    try {
        await client.execute({
            sql: 'INSERT INTO menu_options (id, name, category, is_available) VALUES (?, ?, ?, 1)',
            args: [id, name, category]
        });
        res.json({ id, name, category, is_available: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Delete Option
app.delete('/api/options/:id', async (req, res) => {
    try {
        await client.execute({ sql: 'DELETE FROM menu_options WHERE id = ?', args: [req.params.id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});


// Get Orders
app.get('/api/orders', async (req, res) => {
    try {
        const { rows } = await client.execute('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Get Order Items
app.get('/api/order_items', async (req, res) => {
    const { order_id } = req.query;
    try {
        let sql = `
        SELECT oi.*, mi.name as item_name 
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
      `;
        const args = [];
        if (order_id) {
            sql += ' WHERE oi.order_id = ?';
            args.push(order_id as string);
        }
        const { rows } = await client.execute({ sql, args });

        const formatted = rows.map(r => ({
            ...r,
            customizations: r.customizations ? JSON.parse(r.customizations as string) : [],
            menu_items: { name: r.item_name } // Match frontend format
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Create Order
app.post('/api/orders', async (req, res) => {
    const { customer_name, items } = req.body;
    const orderId = crypto.randomUUID();

    // LibSQL manual transaction
    // Note: Remote HTTP LibSQL doesn't support interactive transactions easily without full transaction endpoint usage.
    // We will do best-effort sequence for MVP. If one fails, we might have orphan data. 
    // Batch execution is better. 

    try {
        // Prepare statements for batch
        const statements = [];

        // 1. Insert Order
        statements.push({
            sql: 'INSERT INTO orders (id, customer_name) VALUES (?, ?)',
            args: [orderId, customer_name]
        });

        // 2. Insert Items
        for (const item of items) {
            statements.push({
                sql: 'INSERT INTO order_items (id, order_id, menu_item_id, customizations) VALUES (?, ?, ?, ?)',
                args: [crypto.randomUUID(), orderId, item.menu_item_id, JSON.stringify(item.customizations || [])]
            });
        }

        await client.batch(statements, 'write');

        // Return created order
        res.json({ id: orderId, customer_name, status: 'pending', created_at: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Update Status
app.put('/api/orders/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await client.execute({
            sql: 'UPDATE orders SET status = ? WHERE id = ?',
            args: [status, req.params.id]
        });
        res.json({ id: req.params.id, status }); // Optimistic response
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Delete Order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        // Cascade delete should handle items, but valid to check
        await client.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [req.params.id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Export app for Vercal
export default app;

// Only listen if not running on Vercel (Vercel handles the server)
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`SmoothBux Backend (Turso) running at http://localhost:${port}`);
    });
}
