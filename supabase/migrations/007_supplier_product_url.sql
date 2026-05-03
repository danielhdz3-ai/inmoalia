-- URL directa a la ficha del producto en el portal del proveedor (opcional).
alter table products
  add column if not exists supplier_product_url text;

comment on column products.supplier_product_url is 'Enlace público del producto en la web/API del proveedor (ej. ficha AW).';

update products
set supplier_product_url = 'https://www.aw-dropship.es/home/sd-furniture/hps/hps-05'
where slug = 'inmoalia-prueba-hps-05';
