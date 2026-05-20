-- Outlet: productos en liquidación (stock bajo) y sillas económicas.
update products set category = 'outlet', updated_at = now()
where slug in (
  'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra',
  'sofa-larios-2-plazas-tejido-velvet-verde-agua-58',
  'sofa-larios-3-plazas-tejido-corduroy-gris',
  'sillon-oficina-fiss-new-negro-malla-tejido-negro',
  'sillon-oficina-fiss-new-blanco-malla-tejido-verde',
  'sillon-oficina-risley-negro-malla-negra-tejido-rojo',
  'sillon-oficina-clent-blanco-malla-tejido-verde',
  'sillon-oficina-verton-blanco-malla-y-asiento-verde'
)
and is_active = true;
