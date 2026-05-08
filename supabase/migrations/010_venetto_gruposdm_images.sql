-- Sustituye placeholders Unsplash por imágenes oficiales del modelo (ficha Grupo SDM, ref. 290.SVENE2SNE).
-- Idempotente: vuelve a fijar las mismas URLs si ya se ejecutó 009 con fotos genéricas.

update products
set
  images = array[
    'https://gruposdm.com/38580-thickbox_default/venetto-sofa-2-seater-stainless-steel-black-synthetic-leather.jpg',
    'https://gruposdm.com/38581-thickbox_default/venetto-sofa-2-seater-stainless-steel-black-synthetic-leather.jpg'
  ]::text[],
  supplier_product_url = 'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofa-de-2-plazas/sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra.html',
  updated_at = now()
where slug = 'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra';
