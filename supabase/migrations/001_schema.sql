-- ============================================
-- INMOALIA — Schema principal
-- ============================================

-- PRODUCTOS
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  price        numeric(10,2) not null,
  cost_price   numeric(10,2),
  images       text[] default '{}',
  category     text not null,
  subcategory  text,
  tags         text[] default '{}',
  sku          text unique,
  supplier_sku text,
  supplier     text,
  stock        integer default 0,
  weight_kg    numeric(6,2),
  dimensions   jsonb,
  material     text,
  color        text,
  is_active    boolean default true,
  is_featured  boolean default false,
  meta_title   text,
  meta_desc    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- CATEGORÍAS
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  image_url   text,
  parent_id   uuid references categories(id),
  sort_order  integer default 0,
  is_active   boolean default true
);

-- CLIENTES
create table if not exists customers (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  address      jsonb,
  created_at   timestamptz default now()
);

-- PEDIDOS
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null,
  customer_id       uuid references customers(id),
  customer_email    text not null,
  status            text default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  stripe_session_id text unique,
  stripe_payment_id text,
  items             jsonb not null default '[]',
  shipping_address  jsonb not null default '{}',
  subtotal          numeric(10,2) not null,
  shipping_cost     numeric(10,2) default 0,
  total             numeric(10,2) not null,
  supplier_order_id text,
  tracking_number   text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- SYNC LOGS
create table if not exists sync_logs (
  id              uuid primary key default gen_random_uuid(),
  supplier        text not null,
  status          text not null check (status in ('success', 'error')),
  products_synced integer default 0,
  errors          jsonb,
  started_at      timestamptz default now(),
  finished_at     timestamptz
);

-- WAITLIST
create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(email, product_id)
);

-- ============================================
-- ÍNDICES
-- ============================================
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_products_is_featured on products(is_featured);
create index if not exists idx_products_search on products using gin(to_tsvector('spanish', name || ' ' || coalesce(description, '')));
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_stripe_session_id on orders(stripe_session_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table products enable row level security;
alter table categories enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table sync_logs enable row level security;
alter table waitlist enable row level security;

-- Products: lectura pública
create policy "Products are publicly readable" on products
  for select using (is_active = true);

-- Categories: lectura pública
create policy "Categories are publicly readable" on categories
  for select using (is_active = true);

-- Customers: solo el propio usuario
create policy "Customers can read own data" on customers
  for select using (auth.uid() = id);

create policy "Customers can update own data" on customers
  for update using (auth.uid() = id);

-- Orders: solo el propio cliente
create policy "Customers can read own orders" on orders
  for select using (
    auth.uid() = customer_id
    or auth.jwt() ->> 'role' = 'service_role'
  );

-- Sync logs: solo service role
create policy "Only service role can read sync logs" on sync_logs
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- Waitlist: cualquiera puede insertar
create policy "Anyone can join waitlist" on waitlist
  for insert with check (true);

create policy "Users can read own waitlist entries" on waitlist
  for select using (auth.uid() is not null);
