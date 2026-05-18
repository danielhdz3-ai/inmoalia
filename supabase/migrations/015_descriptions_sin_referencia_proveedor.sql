-- Descripciones públicas sin frase “Referencia proveedor …”.
update products
set description = btrim(regexp_replace(description, '\s*Referencia proveedor[^.]*\.', '', 'gi'))
where description is not null and description ~* 'referencia proveedor';

-- Meta descripción VENETTO: coherente con 009 (sin código interno en snippet).
update products
set meta_desc = 'Sofá de diseño VENETTO: estructura acero inoxidable, similpiel negra, 132×70×69 cm. Certificación UNE.'
where slug = 'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra'
  and meta_desc is not null;
