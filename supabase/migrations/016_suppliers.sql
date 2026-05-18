-- Directorio de proveedores (interno / admin). products.supplier sigue siendo el slug que las enlaza.
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  contact_name text,
  phone text,
  email text,
  website text,
  shipping_info text,
  delivery_time text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_suppliers_slug on suppliers (slug);
create index if not exists idx_suppliers_active on suppliers (is_active);

drop trigger if exists suppliers_updated_at on suppliers;
create trigger suppliers_updated_at
  before update on suppliers
  for each row execute function update_updated_at();

alter table suppliers enable row level security;

-- Sin políticas: acceso vía service role en backend / Supabase dashboard.

insert into suppliers (
  slug,
  name,
  legal_name,
  contact_name,
  phone,
  email,
  website,
  shipping_info,
  delivery_time,
  notes
) values (
  'gruposdm',
  'Grupo SDM',
  'GRUPO SANS & DICANALS MOBILIARIO S.L.',
  'Ana Téllez — Departamento Comercial',
  '+34 952 426 920',
  'info@gruposdm.com',
  'https://www.gruposdm.com',
  'Política tienda INMOALIA (cliente): envío gratis desde 600 € de pedido. Por debajo, gastos por tramos entre 22 € y 59 € según importe (misma tabla que checkout). El proveedor es mayorista B2B; condiciones mayoristas no aplican al comprador final en la tienda.',
  'Tras el pago: preparación del pedido 24–48 h laborables; entrega estimada al cliente en España peninsular 2–5 días laborables, sujeto al transportista.',
  'Mayoristas de muebles y decoración. Importación y exportación. Mercado España y Portugal. Venta exclusiva a profesionales (catálogo proveedor). Contacto adicional: webmaster@gruposdm.com.'
)
on conflict (slug) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  contact_name = excluded.contact_name,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  shipping_info = excluded.shipping_info,
  delivery_time = excluded.delivery_time,
  notes = excluded.notes,
  updated_at = now();

-- Catálogo actual: piezas SDM bajo slug unificado gruposdm
update products
set supplier = 'gruposdm'
where supplier = 'operativas-sniper'
   or slug = 'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra';
