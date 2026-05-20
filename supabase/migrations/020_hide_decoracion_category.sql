-- Ocultar categoría Decoración del catálogo público.
update categories
set is_active = false
where slug = 'decoracion';
