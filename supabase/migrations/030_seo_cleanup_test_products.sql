-- Limpieza SEO: asegurar que productos de prueba no estén activos ni en feeds.
update products
set is_active = false
where slug ~ '^(producto-test-|inmoalia-prueba-)'
   or tags && array['test', 'prueba', 'interno']::text[];

-- Categorías obsoletas: mantener desactivadas (redirigen vía middleware/vercel).
update categories
set is_active = false
where slug in ('decoracion', 'outlet', 'estanterias');
