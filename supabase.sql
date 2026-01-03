-- Enable Realtime
alter publication supabase_realtime add table orders;

-- Create Menu Items Table
create table menu_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  ingredients text[],
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  status text not null default 'pending', -- pending, blending, ready, completed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Order Items Table (linking orders to menu items)
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) not null,
  customizations text[], -- Array of strings e.g. ["No Sugar", "Extra Ice"]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Create Policies (Public Access for Family App)
-- Menu Items: Everyone can read, anyone can write (simplification for family app)
create policy "Enable read access for all users" on menu_items for select using (true);
create policy "Enable insert access for all users" on menu_items for insert with check (true);
create policy "Enable update access for all users" on menu_items for update using (true);
create policy "Enable delete access for all users" on menu_items for delete using (true);

-- Orders: Everyone can read, anyone can create/update
create policy "Enable read access for all users" on orders for select using (true);
create policy "Enable insert access for all users" on orders for insert with check (true);
create policy "Enable update access for all users" on orders for update using (true);

-- Order Items: Everyone can read, anyone can create
create policy "Enable read access for all users" on order_items for select using (true);
create policy "Enable insert access for all users" on order_items for insert with check (true);

-- Seed Data (Optional - starting menu)
insert into menu_items (name, description, image_url, ingredients, is_available) values
('Mega Mango', 'A tropical explosion of mango and pineapple.', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=600', ARRAY['Mango', 'Pineapple', 'Orange Juice'], true),
('Berry Blast', 'Strawberry, blueberry, and raspberry mix.', 'https://images.unsplash.com/photo-1625944525533-472f0a8d8c7c?auto=format&fit=crop&q=80&w=600', ARRAY['Strawberry', 'Blueberry', 'Raspberry', 'Apple Juice'], true),
('Green Machine', 'Healthy spinach and kale with a sweet apple kick.', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=600', ARRAY['Spinach', 'Kale', 'Green Apple', 'Lemon'], true);
