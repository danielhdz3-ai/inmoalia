-- ============================================
-- Prueba de catálogo: AW HPS-05 a precio de venta fijado por Inmoalia
-- Fuente datos proveedor (CSV público): código HPS-05, coste 19.23 €, imágenes AW.
-- Ejecutar en Supabase (SQL Editor) o con supabase db push si usas CLI.
-- ============================================

insert into products (
  slug,
  name,
  description,
  price,
  cost_price,
  images,
  category,
  subcategory,
  tags,
  sku,
  supplier_sku,
  supplier,
  stock,
  weight_kg,
  dimensions,
  material,
  is_active,
  is_featured,
  meta_title,
  meta_desc
) values (
  'inmoalia-prueba-hps-05',
  'Mesa de Madera de Albasia - Blanqueado',
  'Mesa soporte decorativa de madera de albasia con acabado blanqueado y patas de metal. Pensada como mesita auxiliar o base para plantas. Medidas aprox.: 26×19,5×37 cm (u × f × alto según proveedor AW). Materiales: madera de albasia y metal. Peso neto 0,96 kg.',
  66.32,
  19.23,
  array[
    'https://media.aiku.io/UCaJ56iCTs7aZW1GGB3fuN5HE3iOwdiiDaeDUdkSMi4/bG9jYWw6Ly9tZWRpYS8xUy9HRC82MFIzMEMxRzZSUzNHRDFTL2Y3YTk5NTU5LmpwZWc',
    'https://media.aiku.io/Nd92uE7FyidPZrJZ4cjO6I_sXJt7jxayLgK6Rn8lDkc/bG9jYWw6Ly9tZWRpYS8xUi9HRC82MFIzMEMxRzZSUzNHRDFSL2Y1NzkyY2ExLmpwZWc',
    'https://media.aiku.io/a_Aipgulka8hZX6J6KsYc2ye_9PDttwdB23h3Cdg2Kc/bG9jYWw6Ly9tZWRpYS8xUC9HRC82MFIzMEMxRzZSUzNHRDFQL2M1YzhmODhhLmpwZWc',
    'https://media.aiku.io/QllCYFjphUukDq0092FMwD-Uo5HzHJHB9MYn8CNWJTc/bG9jYWw6Ly9tZWRpYS8xUS9HRC82MFIzMEMxRzZSUzNHRDFRL2U5MTRlYjFjLmpwZWc',
    'https://media.aiku.io/PQDIpgiDRDltguP_YGfK8DfO3NUzVMA3gAXWfjIZHUg/bG9jYWw6Ly9tZWRpYS85Ry9HRC82MFIzMEMxRzZSUzNHRDlHL2VkM2FkMzAyLmpwZWc'
  ]::text[],
  'muebles',
  'Mobiliario y expositores',
  array['prueba','aw-dropship','albasia','hogar'],
  'INM-HPS-05',
  'HPS-05',
  'aw-dropship',
  103,
  0.96,
  '{"width": 26, "height": 37, "depth": 19.5}'::jsonb,
  'Albasia Wood, Metal',
  true,
  true,
  'Mesa de Madera de Albasia Blanqueado | INMOALIA',
  'Mesa auxiliar Albasia blanqueado, patas metálicas. Prueba catálogo Inmoalia.'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  cost_price = excluded.cost_price,
  images = excluded.images,
  category = excluded.category,
  subcategory = excluded.subcategory,
  tags = excluded.tags,
  sku = excluded.sku,
  supplier_sku = excluded.supplier_sku,
  supplier = excluded.supplier,
  stock = excluded.stock,
  weight_kg = excluded.weight_kg,
  dimensions = excluded.dimensions,
  material = excluded.material,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  meta_title = excluded.meta_title,
  meta_desc = excluded.meta_desc,
  updated_at = now();
