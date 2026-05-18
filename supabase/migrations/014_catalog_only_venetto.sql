-- Catálogo limpio: un solo producto real (Sofá VENETTO, migración 009).
-- Elimina seed histórico, pruebas AW (006/008) y cualquier sync previo.
-- Referencias en favoritos / waitlist a otros productos se eliminan en cascada.

delete from products
where slug <> 'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra';
