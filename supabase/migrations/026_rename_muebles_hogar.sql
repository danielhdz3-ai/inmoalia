-- Renombrar categoría muebles → hogar.

update categories
set slug = 'hogar', name = 'Hogar', description = 'Sofás, salón y piezas para completar tu hogar con estilo.'
where slug = 'muebles';

insert into categories (slug, name, description, image_url, sort_order, is_active)
values (
  'hogar',
  'Hogar',
  'Sofás, salón y piezas para completar tu hogar con estilo.',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  7,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true;

update products set category = 'hogar', updated_at = now() where category = 'muebles';

-- Tags prev_cat de ofertas que apuntaban a muebles
update products
set tags = array_replace(tags, 'prev_cat:muebles', 'prev_cat:hogar'),
    updated_at = now()
where 'prev_cat:muebles' = any(tags);
