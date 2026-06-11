-- MAINZ similpiel blanco roto y negro + imágenes CDN en sillones UTRECH/MAINZ.

insert into products (
  slug, name, description, price, cost_price, images, category, subcategory, tags,
  sku, supplier_sku, supplier, stock, dimensions, material, color,
  is_active, is_featured, meta_title, meta_desc, supplier_product_url
) values
(
  'sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto',
  'Sillón de oficina MAINZ, alto · giratorio · similpiel blanco roto',
  'Sillón de oficina moderno. Regulación de altura mediante cilindro neumático. Mecanismo de reclinación. Base cromada con ruedas blandas. Tapizado en similpiel de color blanco roto. Otros colores disponibles.

Dimensiones (cm): ancho 65, fondo 58, alto 110–120. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,16 m³. Certificación UNE.',
  272.25, 132.00,
  array[
    'https://gruposdm.com/38288-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg',
    'https://gruposdm.com/38289-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg',
    'https://gruposdm.com/38290-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg',
    'https://gruposdm.com/38291-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg',
    'https://gruposdm.com/38292-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg',
    'https://gruposdm.com/38293-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.jpg'
  ]::text[],
  'sillas', 'Sillas de oficina',
  array['oficina','sillón','Mainz','similpiel','blanco','dirección','giratorio','pvp_ref']::text[],
  'INM-SMAINASBR', '762.SMAINASBR', 'gruposdm', 77,
  '{"width": 65, "height": 120, "depth": 58}'::jsonb,
  'Similpiel, acero cromado', 'Blanco roto', true, false,
  'Sillón de oficina MAINZ alto similpiel blanco roto | INMOALIA',
  'Sillón MAINZ alto giratorio en similpiel blanco roto. Base cromada y 65×58×110–120 cm. IVA incluido.',
  'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.html'
),
(
  'sillon-de-oficina-mainz-alto-giratorio-similpiel-negra',
  'Sillón de oficina MAINZ, alto · giratorio · similpiel negra',
  'Sillón de oficina moderno. Regulación de altura mediante cilindro neumático. Mecanismo de reclinación. Base cromada con ruedas blandas. Tapizado en similpiel de color negro. Otros colores disponibles.

Dimensiones (cm): ancho 65, fondo 58, alto 110–120. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,16 m³. Certificación UNE.',
  272.25, 132.00,
  array[
    'https://gruposdm.com/38282-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg',
    'https://gruposdm.com/38283-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg',
    'https://gruposdm.com/38284-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg',
    'https://gruposdm.com/38285-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg',
    'https://gruposdm.com/38286-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg',
    'https://gruposdm.com/38287-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.jpg'
  ]::text[],
  'sillas', 'Sillas de oficina',
  array['oficina','sillón','Mainz','similpiel','negro','dirección','giratorio','pvp_ref']::text[],
  'INM-SMAINASNE', '762.SMAINASNE', 'gruposdm', 87,
  '{"width": 65, "height": 120, "depth": 58}'::jsonb,
  'Similpiel, acero cromado', 'Negro', true, false,
  'Sillón de oficina MAINZ alto similpiel negra | INMOALIA',
  'Sillón MAINZ alto giratorio en similpiel negra. Base cromada y 65×58×110–120 cm. IVA incluido.',
  'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.html'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  cost_price = excluded.cost_price,
  images = excluded.images,
  stock = excluded.stock,
  updated_at = now();

update products set images = array[
  'https://gruposdm.com/39067-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
  'https://gruposdm.com/37554-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
  'https://gruposdm.com/37555-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
  'https://gruposdm.com/37556-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg'
]::text[], updated_at = now()
where supplier_sku = '794.SUTRECNNE';

update products set images = array[
  'https://gruposdm.com/38294-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38295-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38296-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38297-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38298-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38299-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg'
]::text[], updated_at = now()
where supplier_sku = '762.SMAINASGR';
