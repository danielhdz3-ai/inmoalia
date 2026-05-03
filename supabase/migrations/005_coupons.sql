-- ============================================
-- CUPONES DE DESCUENTO
-- ============================================

create table if not exists coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  description    text,
  discount_type  text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order      numeric(10,2) default 0,
  max_uses       integer,
  uses_count     integer default 0,
  expires_at     timestamptz,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

create index if not exists idx_coupons_code on coupons(code);

alter table coupons enable row level security;

-- Solo service role puede gestionar cupones (el admin los crea desde Supabase Studio)
create policy "Only service role can manage coupons" on coupons
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- Cupones de ejemplo
insert into coupons (code, description, discount_type, discount_value, min_order, max_uses)
values
  ('BIENVENIDO10', 'Descuento de bienvenida 10%', 'percentage', 10, 0, 1000),
  ('VERANO20',     'Descuento verano 20%',         'percentage', 20, 50, 500),
  ('ENVIOGRATIS',  'Descuento 6€ (envío gratis)',  'fixed',      5.99, 0, 200)
on conflict (code) do nothing;
