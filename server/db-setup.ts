import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
-- Drop tables if they exist to ensure clean slate (Optional, be careful in prod)
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS menu_items;

-- Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  ingredients text[],
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending', 
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) NOT NULL,
  customizations text[],
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Seed Data (if menu empty)
INSERT INTO menu_items (name, description, image_url, ingredients, is_available) 
SELECT 'Mega Mango', 'A tropical explosion of mango and pineapple.', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=600', ARRAY['Mango', 'Pineapple', 'Orange Juice'], true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mega Mango');

INSERT INTO menu_items (name, description, image_url, ingredients, is_available) 
SELECT 'Berry Blast', 'Strawberry, blueberry, and raspberry mix.', 'https://images.unsplash.com/photo-1553530666-ba11a906974e?auto=format&fit=crop&q=80&w=600', ARRAY['Strawberry', 'Blueberry', 'Raspberry', 'Apple Juice'], true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Berry Blast');

INSERT INTO menu_items (name, description, image_url, ingredients, is_available) 
SELECT 'Green Machine', 'Healthy spinach and kale with a sweet apple kick.', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=600', ARRAY['Spinach', 'Kale', 'Green Apple', 'Lemon'], true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Green Machine');
`;

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Neon Postgres.');
    await client.query(schema);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
