-- Sofás LARIOS (Grupo SDM) · margen +50 € sobre coste proveedor.

insert into products (
  slug, name, description, price, cost_price, images, category, subcategory, tags,
  sku, supplier_sku, supplier, stock, dimensions, material, color,
  is_active, is_featured, meta_title, meta_desc, supplier_product_url
) values
(
  'sofa-larios-2-plazas-tejido-velvet-verde-agua-58',
  'Sofá LARIOS · 2 plazas · tejido velvet verde agua 58',
  'Sofá de diseño, 2 plazas, multiusos. Interior con armazón de madera y espuma de gran densidad. Patas metálicas con acabado dorado. Tapizado en tejido velvet verde agua 58. Cojines decorativos incluidos. Sofá de 3 plazas a juego opcional; otros colores bajo pedido.

Dimensiones (cm): ancho 157, fondo 84, alto 71. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,82 m³. Producto nuevo con certificado (test report) de laboratorio internacional homologado (normativa UNE o equivalente internacional).',
  465.00, 415.00,
  array[
    '/imagenes/productos/sofa-larios-2-plazas-tejido-velvet-verde-agua-58-1.jpg',
    '/imagenes/productos/sofa-larios-2-plazas-tejido-velvet-verde-agua-58-2.jpg',
    '/imagenes/productos/sofa-larios-2-plazas-tejido-velvet-verde-agua-58-3.jpg'
  ]::text[],
  'muebles', 'Sofás y butacas',
  array['LARIOS','sofá','salón','muebles','diseño','verde']::text[],
  'INM-252SLAR2VE58', '252.SLAR2VE58', 'gruposdm', 5,
  '{"width": 157, "height": 71, "depth": 84}'::jsonb,
  'Madera, espuma alta densidad, velvet', 'Verde',
  true, false,
  'Sofá LARIOS 2 plazas velvet verde agua | INMOALIA',
  'Sofá LARIOS 2 plazas en velvet verde agua. Patas doradas, cojines incluidos. 157×84×71 cm. Certificación UNE.',
  'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofa-de-2-plazas/sofa-larios-2-plazas-tejido-velvet-verde-agua-58.html'
),
(
  'sofa-larios-3-plazas-tejido-corduroy-gris',
  'Sofá LARIOS · 3 plazas · tejido corduroy gris',
  'Sofá de diseño, 3 plazas, multiusos. Interior con armazón de madera y espuma de gran densidad. Patas metálicas con acabado dorado. Tapizado en tejido corduroy gris. Cojines decorativos incluidos. Sofá de 2 plazas a juego opcional; otros colores bajo pedido.

Dimensiones (cm): ancho 208, fondo 84, alto 71. Embalaje: plástico y cartón. Unidad: 1 · volumen: 1,01 m³. Producto nuevo con certificado (test report) de laboratorio internacional homologado (normativa UNE o equivalente internacional).',
  555.00, 505.00,
  array[
    '/imagenes/productos/sofa-larios-3-plazas-tejido-corduroy-gris-1.jpg',
    '/imagenes/productos/sofa-larios-3-plazas-tejido-corduroy-gris-2.jpg'
  ]::text[],
  'muebles', 'Sofás y butacas',
  array['LARIOS','sofá','salón','muebles','diseño','gris']::text[],
  'INM-252SLAR3COGR', '252.SLAR3COGR', 'gruposdm', 5,
  '{"width": 208, "height": 71, "depth": 84}'::jsonb,
  'Madera, espuma alta densidad, corduroy', 'Gris',
  true, false,
  'Sofá LARIOS 3 plazas corduroy gris | INMOALIA',
  'Sofá LARIOS 3 plazas en corduroy gris. Patas doradas, cojines incluidos. 208×84×71 cm. Certificación UNE.',
  'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofas-de-3-plazas/sofa-larios-3-plazas-tejido-corduroy-gris.html'
),
(
  'sofa-larios-3-plazas-tapizado-similpiel-blanca',
  'Sofá LARIOS · 3 plazas · tapizado similpiel blanca',
  'Sofá de diseño, 3 plazas, multiusos. Interior con armazón de madera y espuma de gran densidad. Patas metálicas con acabado dorado. Tapizado en similpiel blanca. Cojines decorativos incluidos. Sofá de 2 plazas a juego opcional; otros colores bajo pedido.

Dimensiones (cm): ancho 208, fondo 84, alto 71. Embalaje: plástico y cartón. Unidad: 1 · volumen: 1,01 m³. Producto nuevo con certificado (test report) de laboratorio internacional homologado (normativa UNE o equivalente internacional).',
  548.00, 498.00,
  array[
    '/imagenes/productos/sofa-larios-3-plazas-tapizado-similpiel-blanca-1.jpg',
    '/imagenes/productos/sofa-larios-3-plazas-tapizado-similpiel-blanca-2.jpg'
  ]::text[],
  'muebles', 'Sofás y butacas',
  array['LARIOS','sofá','salón','muebles','diseño','blanco']::text[],
  'INM-252SLAR3SBL', '252.SLAR3SBL', 'gruposdm', 10,
  '{"width": 208, "height": 71, "depth": 84}'::jsonb,
  'Madera, espuma alta densidad, similpiel', 'Blanco',
  true, false,
  'Sofá LARIOS 3 plazas similpiel blanca | INMOALIA',
  'Sofá LARIOS 3 plazas en similpiel blanca. Patas doradas, cojines incluidos. 208×84×71 cm. Certificación UNE.',
  'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofas-de-3-plazas/sofa-larios-3-plazas-tapizado-similpiel-blanca.html'
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
  dimensions = excluded.dimensions,
  material = excluded.material,
  color = excluded.color,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  meta_title = excluded.meta_title,
  meta_desc = excluded.meta_desc,
  supplier_product_url = coalesce(products.supplier_product_url, excluded.supplier_product_url),
  updated_at = now();
