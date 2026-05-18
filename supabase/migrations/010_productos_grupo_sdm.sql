-- ============================================
-- INMOALIA - Inserción de productos Grupo SDM
-- ============================================
-- Este script inserta 5 productos de ejemplo de Grupo SDM
-- Ajusta los precios según tu acuerdo mayorista

-- IMPORTANTE: Ejecutar primero la categoría
INSERT INTO categories (slug, name, description, is_active, sort_order)
VALUES 
  ('sillas-oficina', 'Sillas de Oficina', 'Sillas ergonómicas y sillones para oficina y teletrabajo', true, 1)
ON CONFLICT (slug) DO NOTHING;

-- PRODUCTOS DE EJEMPLO (ajusta precios según tu margen)
-- Estos son 5 productos populares de Grupo SDM
-- Precio de ejemplo: Si compras a 50€, vendes a 99€ (margen ~50%)

INSERT INTO products (
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
  material,
  color,
  is_active,
  is_featured,
  meta_title,
  meta_desc
) VALUES 
(
  'sillon-paradise-cromado-negro',
  'Sillón PARADISE, giratorio, cromado, tapizado negro',
  'Sillón de oficina giratorio con estructura cromada y tapizado en negro. Regulación de altura mediante pistón de gas, respaldo ergonómico y base de 5 ruedas para máxima movilidad. Ideal para oficinas modernas y espacios de teletrabajo.',
  129.90, -- Precio venta (ajustar según tu margen)
  65.00,  -- Precio compra (ajustar según tu acuerdo con Grupo SDM)
  ARRAY[
    'https://gruposdm.com/12345-large_default/sillon-paradise-giratorio-cromado-tapizado-negro.jpg'
  ], -- Cambiar por URL real de imagen
  'sillas-oficina',
  'sillones-giratorios',
  ARRAY['sillon', 'oficina', 'giratorio', 'negro', 'cromado', 'ergonomico'],
  'INMO-PARADISE-NE',
  '712.SPARGSNE', -- SKU real de Grupo SDM
  'grupo-sdm',
  10, -- Stock inicial estimado (verificar con proveedor)
  12.5,
  'Metal cromado, polipiel',
  'Negro',
  true,
  true,
  'Sillón de Oficina PARADISE Cromado Negro | INMOALIA',
  'Sillón giratorio cromado con tapizado negro. Ergonómico, regulable en altura, perfecto para oficina. Envío gratis desde 600€.'
),
(
  'sillon-duke-alto-similpiel-negra',
  'Sillón de oficina DUKE, alto, gas, basculante, similpiel negra',
  'Sillón de dirección alto con respaldo ergonómico y mecanismo basculante. Fabricado en similpiel negra de alta calidad, con reposabrazos acolchados y base de aluminio pulido. Regulación de altura mediante pistón de gas certificado.',
  189.90,
  95.00,
  ARRAY[
    'https://gruposdm.com/12346-large_default/sillon-duke-alto-gas-basculante-similpiel-negra.jpg'
  ],
  'sillas-oficina',
  'sillones-direccion',
  ARRAY['sillon', 'direccion', 'alto', 'ejecutivo', 'negro', 'basculante'],
  'INMO-DUKE-NE',
  '762.SDUKASNE',
  'grupo-sdm',
  8,
  15.0,
  'Similpiel, aluminio',
  'Negro',
  true,
  true,
  'Sillón Dirección DUKE Alto Similpiel Negra | INMOALIA',
  'Sillón ejecutivo de dirección alto, similpiel negra, mecanismo basculante. Máximo confort y elegancia para tu oficina.'
),
(
  'sillon-clayton-negro-malla-negro',
  'Sillón de oficina CLAYTON, negro, malla y tejido negro',
  'Sillón operativo con respaldo de malla transpirable que favorece la ventilación. Asiento tapizado en tejido negro resistente, reposabrazos fijos y mecanismo sincro para mayor ergonomía durante largas jornadas de trabajo.',
  149.90,
  75.00,
  ARRAY[
    'https://gruposdm.com/12347-large_default/sillon-clayton-negro-malla-y-tejido-negro.jpg'
  ],
  'sillas-oficina',
  'sillas-operativas',
  ARRAY['sillon', 'malla', 'transpirable', 'negro', 'ergonomico', 'sincro'],
  'INMO-CLAYTON-NE',
  '794.SCLAYNNNE',
  'grupo-sdm',
  12,
  11.0,
  'Malla, tejido, nylon',
  'Negro',
  true,
  false,
  'Sillón Oficina CLAYTON Malla Negra | INMOALIA',
  'Sillón operativo con malla transpirable y mecanismo sincro. Ergonómico y cómodo para tu día a día en la oficina.'
),
(
  'sillon-fiss-new-blanco-malla-verde',
  'Sillón de oficina FISS NEW, blanco, regulación de altura, basculante, malla y tejido verde',
  'Sillón moderno con estructura blanca y detalles en verde. Respaldo de malla transpirable, asiento tapizado en tejido de alta densidad. Mecanismo basculante con bloqueo en varias posiciones y regulación de altura mediante pistón de gas.',
  159.90,
  80.00,
  ARRAY[
    'https://gruposdm.com/12348-large_default/sillon-fiss-new-blanco-malla-verde.jpg'
  ],
  'sillas-oficina',
  'sillas-operativas',
  ARRAY['sillon', 'blanco', 'verde', 'moderno', 'malla', 'basculante'],
  'INMO-FISS-VE',
  '762.SFIBGMTVP',
  'grupo-sdm',
  10,
  10.5,
  'Malla, tejido, polipropileno',
  'Blanco y verde',
  true,
  false,
  'Sillón FISS NEW Blanco y Verde Malla | INMOALIA',
  'Sillón operativo moderno blanco con detalles verdes. Malla transpirable, basculante y ergonómico.'
),
(
  'sillon-verton-negro-malla-negro',
  'Sillón de oficina VERTON, negro, malla negra, asiento negro',
  'Sillón de dirección con diseño minimalista y líneas elegantes. Respaldo alto de malla negra transpirable, asiento acolchado con espuma de alta densidad. Reposabrazos ajustables en altura y mecanismo sincro con tensor regulable.',
  199.90,
  100.00,
  ARRAY[
    'https://gruposdm.com/12349-large_default/sillon-verton-negro-malla-negra-asiento-negro.jpg'
  ],
  'sillas-oficina',
  'sillones-direccion',
  ARRAY['sillon', 'direccion', 'negro', 'malla', 'alto', 'sincro', 'ajustable'],
  'INMO-VERTON-NE',
  '766.SVEANMANE',
  'grupo-sdm',
  6,
  14.0,
  'Malla, tejido, metal',
  'Negro',
  true,
  true,
  'Sillón Dirección VERTON Malla Negra | INMOALIA',
  'Sillón ejecutivo VERTON todo negro con malla transpirable. Reposabrazos ajustables y mecanismo sincro avanzado.'
);

-- Verificar inserción
SELECT 
  name,
  sku,
  supplier_sku,
  price as pvp,
  cost_price as coste,
  (price - cost_price) as margen,
  ROUND(((price - cost_price) / cost_price * 100)::numeric, 1) as margen_porcentaje,
  is_active,
  is_featured
FROM products
WHERE supplier = 'grupo-sdm'
ORDER BY created_at DESC;
