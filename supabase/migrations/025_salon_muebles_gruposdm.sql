-- Renombrar subcategoría Estanterías → Salón y productos Grupo SDM (margen +90 €).

update products set subcategory = 'Salón', updated_at = now()
where subcategory = 'Estanterías';

-- Los INSERT con imágenes locales se aplican vía scripts/add-salon-muebles.mjs.
-- Registro de referencia para despliegues sin script:

-- ELOISE TV 645.MTVELOIMB · coste 111,30 → PVP 201,30
-- ELOISE mesa baja 145.MBELOISMB · coste 51,80 → PVP 141,80
-- SIENA TV negro 645.MTVSIENMN · coste 102,90 → PVP 192,90
-- SIENA TV blanco 645.MTVSIENMB · coste 102,90 → PVP 192,90
-- VIOLET TV 645.MTVVIOBL · coste 94,50 → PVP 184,50
