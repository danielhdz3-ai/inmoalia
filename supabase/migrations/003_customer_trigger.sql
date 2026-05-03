-- =============================================================================
-- Trigger: crear fila en public.customers al registrar un nuevo usuario en auth
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Rellenar filas faltantes para usuarios ya existentes
INSERT INTO public.customers (id, full_name)
SELECT
  u.id,
  u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.id = u.id
);
