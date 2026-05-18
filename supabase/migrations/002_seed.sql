-- ============================================
-- INMOALIA — Seed: Categorías
-- Los productos reales se cargan en migraciones posteriores (p. ej. 009 VENETTO).
-- ============================================
insert into categories (slug, name, description, image_url, sort_order) values
  ('jardin', 'Jardín', 'Muebles y accesorios para exteriores', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', 1),
  ('mesas', 'Mesas', 'Mesas de comedor, jardín y auxiliares', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 2),
  ('sillas', 'Sillas', 'Sillas de comedor, jardín y butacas', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', 3),
  ('iluminacion', 'Iluminación', 'Lámparas de pie, apliques y colgantes', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', 4),
  ('decoracion', 'Decoración', 'Espejos, cuadros, jarrones y más', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 5),
  ('textil', 'Textil', 'Cojines, alfombras y mantas', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 6),
  ('muebles', 'Muebles', 'Sofás, estanterías y más', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 7),
  ('outlet', 'Outlet', 'Las mejores ofertas', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800', 8)
on conflict (slug) do nothing;
