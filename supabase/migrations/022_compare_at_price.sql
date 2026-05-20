-- Precio de referencia (tachado) para descuentos en outlet, sin confundir con coste proveedor.
alter table products
  add column if not exists compare_at_price numeric(10,2);
