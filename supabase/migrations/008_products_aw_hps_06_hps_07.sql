-- ============================================
-- Catálogo AW: HPS-06 (Terracota) y HPS-07 (Turquesa), mismo criterio que 006_prueba_producto_aw_hps05.sql
-- Coste proveedor 19,23 €; PVP tienda como línea INM-HPS-05/06/07 (66,32 €).
-- Imágenes: CDN media.aiku.io (fuente página pública AW).
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
  color,
  is_active,
  is_featured,
  meta_title,
  meta_desc
) values (
  'inmoalia-prueba-hps-06',
  'Mesa de Madera de Albasia - Terracota',
  'Mesa soporte decorativa de madera de albasia con acabado terracota y patas de metal estilo hairpin. Ideal como mesita auxiliar o base para plantas. Medidas aprox.: 26×19,5×37 cm. Materiales: madera de albasia y metal. Peso neto 0,96 kg. Código barras proveedor 5056368316470. Origen Indonesia.',
  66.32,
  19.23,
  array[
    'https://media.aiku.io/fHUJNUUV78PZ9JnZCiDcBVP_E6w2Yud4vK5D-r40by8/bG9jYWw6Ly9tZWRpYS85TS9HRC82MFIzMEMxRzZSUzNHRDlNLzE0NzhlMjBmLmpwZWc',
    'https://media.aiku.io/WMKesqzf4nlZtvd516XiyxJe292n35_MhO9I8s0tOhM/bG9jYWw6Ly9tZWRpYS85SC9HRC82MFIzMEMxRzZSUzNHRDlILzQxODA3NTZmLmpwZWc',
    'https://media.aiku.io/NauTqP3zWb4PwmUWL-ee-DmsqKpavzGJbInpK8AaEts/bG9jYWw6Ly9tZWRpYS85Si9HRC82MFIzMEMxRzZSUzNHRDlKL2E1MTA2NmQyLmpwZWc',
    'https://media.aiku.io/z_7_NoKp68F0eAzTKBki15IBq-T0j-_UnhdIo4vvKpk/bG9jYWw6Ly9tZWRpYS9TTS9HQy82MFIzMEMxRzZSUzNHQ1NNLzc3NTJiYjdlLmpwZWc',
    'https://media.aiku.io/C-YrAwX_U5MwzxOD9t7UmakJvi3JlFexQ1d98fq1aqQ/bG9jYWw6Ly9tZWRpYS85Sy9HRC82MFIzMEMxRzZSUzNHRDlLL2Q1OTk0MWYyLmpwZWc'
  ]::text[],
  'muebles',
  'Mobiliario y expositores',
  array['prueba','aw-dropship','albasia','hogar','terracota'],
  'INM-HPS-06',
  'HPS-06',
  'aw-dropship',
  114,
  0.96,
  '{"width": 26, "height": 37, "depth": 19.5}'::jsonb,
  'Albasia Wood, Metal',
  'Terracota',
  true,
  true,
  'Mesa de Madera de Albasia Terracota | INMOALIA',
  'Mesa auxiliar Albasia color terracota, patas metálicas. Catálogo Inmoalia / AW Dropship.'
),
(
  'inmoalia-prueba-hps-07',
  'Mesa de Madera de Albasia - Turquesa',
  'Mesa soporte decorativa de madera de albasia con acabado turquesa y patas de metal estilo hairpin. Ideal como mesita auxiliar o base para plantas. Medidas aprox.: 26×19,5×37 cm. Materiales: madera de albasia y metal. Peso neto 0,96 kg. Origen Indonesia.',
  66.32,
  19.23,
  array[
    'https://media.aiku.io/yJYn5ZsSBsuGjDJom4UsQ-n5v67eWAi8NhwoKlcWZiM/bG9jYWw6Ly9tZWRpYS9IRy9HRC82MFIzMEMxRzZSUzNHREhHLzQ1MDY4M2VhLmpwZWc',
    'https://media.aiku.io/JavWAM-aCSonPW_P73GJCLg9JpnqCrjMXSE_FdFGHZ0/bG9jYWw6Ly9tZWRpYS85UC9HRC82MFIzMEMxRzZSUzNHRDlQLzNjMzdhZjcxLmpwZWc',
    'https://media.aiku.io/WEfHNwEVDsv-x7keiC_NrqvEuCkyZCukGMStcNsDaBk/bG9jYWw6Ly9tZWRpYS85Ti9HRC82MFIzMEMxRzZSUzNHRDlOL2VjNzMzMjYyLmpwZWc',
    'https://media.aiku.io/DPJEBo1ryU33Q9na6dvfdZml9AN6e4ntQKifu1SGBOE/bG9jYWw6Ly9tZWRpYS85US9HRC82MFIzMEMxRzZSUzNHRDlRL2IxOTk1ZTdiLmpwZWc',
    'https://media.aiku.io/5xP05wxE9xNeel0_sTqNDdtByy07gEdoU_1ONiu_odc/bG9jYWw6Ly9tZWRpYS85Ui9HRC82MFIzMEMxRzZSUzNHRDlSL2Y5MzUyYTIyLmpwZWc'
  ]::text[],
  'muebles',
  'Mobiliario y expositores',
  array['prueba','aw-dropship','albasia','hogar','turquesa'],
  'INM-HPS-07',
  'HPS-07',
  'aw-dropship',
  108,
  0.96,
  '{"width": 26, "height": 37, "depth": 19.5}'::jsonb,
  'Albasia Wood, Metal',
  'Turquesa',
  true,
  true,
  'Mesa de Madera de Albasia Turquesa | INMOALIA',
  'Mesa auxiliar Albasia color turquesa, patas metálicas. Catálogo Inmoalia / AW Dropship.'
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
  color = excluded.color,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  meta_title = excluded.meta_title,
  meta_desc = excluded.meta_desc,
  updated_at = now();

update products
set supplier_product_url = 'https://www.aw-dropship.es/home/sd-furniture/hps/hps-06'
where slug = 'inmoalia-prueba-hps-06';

update products
set supplier_product_url = 'https://www.aw-dropship.es/home/sd-furniture/hps/hps-07'
where slug = 'inmoalia-prueba-hps-07';
