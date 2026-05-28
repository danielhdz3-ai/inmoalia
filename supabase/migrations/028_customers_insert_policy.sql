-- Permite upsert desde el cliente cuando aún no existe fila en customers
CREATE POLICY "Customers can insert own data" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Rellenar filas faltantes (p. ej. usuarios creados vía admin API)
INSERT INTO public.customers (id, full_name)
SELECT
  u.id,
  u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.id = u.id
);
