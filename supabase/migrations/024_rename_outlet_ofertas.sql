-- Renombrar categoría outlet → ofertas.
alter table products
  add column if not exists compare_at_price numeric(10,2);

update categories
set slug = 'ofertas', name = 'Ofertas', description = 'Las mejores ofertas de nuestra selección con descuentos especiales.'
where slug = 'outlet';

insert into categories (slug, name, description, image_url, sort_order, is_active)
values (
  'ofertas',
  'Ofertas',
  'Las mejores ofertas de nuestra selección con descuentos especiales.',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800',
  8,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true;

update products set category = 'ofertas', updated_at = now() where category = 'outlet';

-- Sillas en ofertas con PVP referencia (descuento visible).
update products set category = 'ofertas', compare_at_price = 249, updated_at = now()
where slug = 'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro';

update products set category = 'ofertas', compare_at_price = 149, updated_at = now()
where slug = 'sillon-de-oficina-clayton-blanco-malla-gris-tejido-azul-claro';

update products set category = 'ofertas', compare_at_price = 179, updated_at = now()
where slug = 'sillon-oficina-clayton-negro-malla-tejido-negro';

update products set category = 'ofertas', compare_at_price = 109, updated_at = now()
where slug = 'sillon-oficina-clent-blanco-malla-tejido-verde';

update products set category = 'ofertas', compare_at_price = 99, updated_at = now()
where slug = 'sillon-oficina-fiss-new-blanco-malla-tejido-verde';

update products set category = 'ofertas', compare_at_price = 99, updated_at = now()
where slug = 'sillon-oficina-fiss-new-negro-malla-tejido-negro';

update products set category = 'ofertas', compare_at_price = 109, updated_at = now()
where slug = 'sillon-oficina-risley-negro-malla-negra-tejido-rojo';

update products set category = 'ofertas', compare_at_price = 115, updated_at = now()
where slug = 'sillon-de-oficina-utrecht-alto-negro-malla-y-tejido-negro';

update products set category = 'ofertas', compare_at_price = 119, updated_at = now()
where slug = 'sillon-oficina-verton-blanco-malla-y-asiento-verde';

update products set category = 'ofertas', compare_at_price = 129, updated_at = now()
where slug = 'sillon-ejecutivo-bernay-malla-negro';

update products set category = 'ofertas', compare_at_price = 119, updated_at = now()
where slug = 'sillon-oficina-mellac-alto-negro-malla-asiento-negro';

update products set compare_at_price = 499, updated_at = now()
where slug = 'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra';

update products set compare_at_price = 549, updated_at = now()
where slug = 'sofa-larios-2-plazas-tejido-velvet-verde-agua-58';

update products set compare_at_price = 649, updated_at = now()
where slug = 'sofa-larios-3-plazas-tejido-corduroy-gris';
