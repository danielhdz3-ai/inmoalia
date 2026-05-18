# Guía de Trabajo con Grupo SDM

## 📋 Información de contacto

**Grupo SDM - Mayorista de muebles y decoración**
- 🌐 Web: https://gruposdm.com
- 📧 Email: comercial@gruposdm.com
- ☎️ Teléfono: 952 426 920
- 📱 WhatsApp: 663 883 455 / 663 813 157
- 📍 Dirección: Calle Ignacio Aldecoa, 15, 29004 Málaga

## ⚠️ IMPORTANTE: No tienen API

Grupo SDM es un mayorista tradicional **sin API pública**. Todo se gestiona de forma manual:

1. **Pedidos**: Por email, teléfono o WhatsApp
2. **Stock**: Consultar disponibilidad antes de vender
3. **Precios**: Revisar catálogo o preguntar
4. **Tracking**: Te lo envían cuando hagan el envío

## 🛍️ Flujo de trabajo

### 1. Agregar productos a INMOALIA

**Opción A: Usar el script SQL (5 productos de ejemplo)**
```bash
# 1. Abre Supabase Dashboard → SQL Editor
# 2. Copia y pega el contenido de:
#    supabase/migrations/010_productos_grupo_sdm.sql
# 3. Ajusta precios según tu margen
# 4. Ejecuta el script
```

**Opción B: Importar desde JSON (recomendado para muchos productos)**
```bash
# 1. Copia productos-template.json a productos.json
cp scripts/productos-template.json scripts/productos.json

# 2. Edita productos.json con tus productos reales
# 3. Descarga/sube imágenes a Supabase Storage o Cloudinary
# 4. Actualiza las URLs de imágenes en el JSON
# 5. Ajusta precios según tu margen

# 6. Importa a la base de datos
node scripts/import-products.mjs productos.json
```

### 2. Cuando llega un pedido

**El sistema hace automáticamente:**
1. ✅ Crea el pedido en Supabase
2. ✅ Cobra al cliente con Stripe
3. ✅ Envía email de confirmación al cliente

**Tú debes hacer manualmente:**

1. **Ver el pedido en el panel de admin:**
   - Ir a https://inmoalia.com/admin/pedidos
   - Ver los productos y SKUs

2. **Hacer el pedido a Grupo SDM:**
   ```
   Opción 1: WhatsApp (más rápido)
   - Click en "Enviar a Grupo SDM por WhatsApp" en el panel
   - Se abre WhatsApp con el pedido pre-escrito
   - Enviar mensaje

   Opción 2: Email
   - Enviar a comercial@gruposdm.com
   - Incluir: SKUs, cantidades, dirección de envío
   - Referencia del pedido INMOALIA

   Opción 3: Teléfono
   - Llamar al 952 426 920
   - Dar los SKUs y cantidades
   ```

3. **Cuando Grupo SDM envíe:**
   - Te darán un número de tracking
   - Actualizar el pedido en Supabase:
     - Estado: `shipped`
     - Tracking number: el que te den
   - El sistema enviará automáticamente email al cliente

### 3. Gestión de stock

⚠️ **IMPORTANTE:** Grupo SDM no tiene stock en tiempo real

**Mejores prácticas:**
1. Contacta con ellos para saber qué tienen disponible
2. Actualiza el stock en la base de datos manualmente
3. Si un producto se agota, márcalo como `is_active = false`
4. Revisa stock semanalmente

## 💰 Configuración de precios

### Ejemplo de margen:

| Concepto | Precio |
|----------|--------|
| Precio compra Grupo SDM | 65,00€ |
| Margen deseado (100%) | +65,00€ |
| **Precio venta INMOALIA** | **130,00€** |

### Costes a considerar:

- Precio mayorista Grupo SDM
- Gastos de envío (si no es dropshipping directo)
- Comisión Stripe (1,4% + 0,25€)
- Comisión Vercel (gratis con Hobby)
- Tu margen de beneficio

### Recomendación:

- **Margen mínimo:** 40-50% sobre precio compra
- **Margen óptimo:** 80-100% para absorber costes y campañas
- **Productos destacados:** Margen menor para competir (30-40%)

## 📸 Gestión de imágenes

**Opciones:**

1. **Pedir imágenes a Grupo SDM**
   - Suelen tener fotos profesionales
   - Preguntar por email

2. **Descargar de su web**
   - https://gruposdm.com
   - Click derecho → Guardar imagen
   - ⚠️ Verificar que puedes usarlas

3. **Hacer fotos profesionales**
   - Si compras muestras
   - Mejor calidad y control

**Dónde alojar las imágenes:**

```bash
# Opción A: Supabase Storage (recomendado)
# 1. Ir a Supabase Dashboard → Storage
# 2. Crear bucket "product-images" (público)
# 3. Subir imágenes
# 4. Copiar URL pública

# Opción B: Cloudinary (gratis hasta 25GB)
# 1. Crear cuenta en cloudinary.com
# 2. Subir imágenes
# 3. Copiar URL

# Opción C: Vercel Blob Storage
# (De pago, no recomendado para empezar)
```

## 🚚 Información de envíos

**Costes actuales (según gruposdm):**

| Importe pedido | Coste envío |
|----------------|-------------|
| 1 - 60€ | 22€ |
| 61 - 120€ | 28€ |
| 121 - 190€ | 33€ |
| 191 - 300€ | 39€ |
| 301 - 400€ | 45€ |
| 401 - 500€ | 49€ |
| 501 - 599€ | 59€ |
| **≥ 600€** | **GRATIS** |

⚠️ **IMPORTANTE:** Estos costes ya están configurados en `lib/shop/shipping.ts`

## 📞 ¿Dropshipping directo?

Pregunta a Grupo SDM si pueden:
1. Enviar directamente a tus clientes
2. No incluir albarán con sus precios
3. Poner tu marca/logo en el paquete
4. Condiciones especiales para dropshipping

## 📝 Checklist semanal

- [ ] Revisar stock de productos más vendidos
- [ ] Actualizar precios si Grupo SDM los cambia
- [ ] Procesar pedidos pendientes
- [ ] Actualizar tracking de envíos
- [ ] Contactar Grupo SDM para novedades
- [ ] Añadir nuevos productos al catálogo

## 🆘 Soporte

Si tienes dudas:
1. Contacta con Grupo SDM directamente
2. Revisa esta guía
3. Consulta el código en `lib/providers/grupo-sdm.ts`
