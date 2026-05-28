-- Permite ver pedidos vinculados por email cuando customer_id quedó vacío
DROP POLICY IF EXISTS "Customers can read own orders" ON orders;

CREATE POLICY "Customers can read own orders" ON orders
  FOR SELECT USING (
    auth.uid() = customer_id
    OR lower(trim(customer_email)) = lower(trim(auth.jwt() ->> 'email'))
  );
