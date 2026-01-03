import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Please set them in .env');
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function migrate() {
    try {
        console.log('Connecting to Turso...');

        // 1. Menu Items Table (SQLite style)
        // Note: SQLite doesn't have text[], so we store ingredients as JSON string
        await client.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                ingredients TEXT, 
                is_available BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')) NOT NULL
            );
        `);

        // 2. Orders Table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT DEFAULT (datetime('now')) NOT NULL
            );
        `);

        // 3. Order Items Table
        await client.execute(`
             CREATE TABLE IF NOT EXISTS order_items (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                menu_item_id TEXT NOT NULL,
                customizations TEXT, -- JSON array
                created_at TEXT DEFAULT (datetime('now')) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
            );
        `);

        // 4. Menu Options Table (Boosts/Juices)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS menu_options (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL, -- 'boost' | 'juice'
                is_available BOOLEAN DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')) NOT NULL
            );
        `);

        console.log('Tables created.');

        // 4. Seed Data
        const seedCheck = await client.execute("SELECT count(*) as count FROM menu_items");
        if (Number(seedCheck.rows[0].count) === 0) {
            console.log('Seeding data...');

            const items = [
                {
                    id: crypto.randomUUID(),
                    name: 'Mega Mango',
                    description: 'A tropical explosion of mango and pineapple.',
                    image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=600',
                    ingredients: JSON.stringify(['Mango', 'Pineapple', 'Orange Juice']),
                    is_available: 1
                },
                {
                    id: crypto.randomUUID(),
                    name: 'Berry Blast',
                    description: 'Strawberry, blueberry, and raspberry mix.',
                    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a906974e?auto=format&fit=crop&q=80&w=600',
                    ingredients: JSON.stringify(['Strawberry', 'Blueberry', 'Raspberry', 'Apple Juice']),
                    is_available: 1
                },
                {
                    id: crypto.randomUUID(),
                    name: 'Green Machine',
                    description: 'Healthy spinach and kale with a sweet apple kick.',
                    image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=600',
                    ingredients: JSON.stringify(['Spinach', 'Kale', 'Green Apple', 'Lemon']),
                    is_available: 1
                }
            ];

            for (const item of items) {
                await client.execute({
                    sql: "INSERT INTO menu_items (id, name, description, image_url, ingredients, is_available) VALUES (?, ?, ?, ?, ?, ?)",
                    args: [item.id, item.name, item.description, item.image_url, item.ingredients, item.is_available]
                });
            }
            console.log('Seeding complete.');
        } else {
            console.log('Tables already seeded.');
        }

        // Seed Options
        const optionsSeedCheck = await client.execute("SELECT count(*) as count FROM menu_options");
        if (Number(optionsSeedCheck.rows[0].count) === 0) {
            console.log('Seeding options...');
            const options = [
                { name: 'Protein Powder', category: 'boost' },
                { name: 'Vitamin C', category: 'boost' },
                { name: 'Energy Shot', category: 'boost' },
                { name: 'Apple Juice', category: 'juice' },
                { name: 'Orange Juice', category: 'juice' },
                { name: 'Almond Milk', category: 'juice' },
                { name: 'Coconut Water', category: 'juice' },
            ];

            for (const opt of options) {
                await client.execute({
                    sql: "INSERT INTO menu_options (id, name, category, is_available) VALUES (?, ?, ?, 1)",
                    args: [crypto.randomUUID(), opt.name, opt.category]
                });
            }
            console.log('Options seeded.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
