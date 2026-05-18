# Guía de Trabajo con Grupo SDM

## ⚠️ CONFIDENCIAL - SOLO PARA USO INTERNO

**IMPORTANTE:** Esta información es SOLO para el administrador de INMOALIA. 
Los clientes finales NUNCA deben saber que trabajamos con Grupo SDM.

**Para el cliente:**
- INMOALIA es el proveedor/fabricante directo
- No mencionamos dropshipping ni mayoristas
- Toda comunicación es marca INMOALIA

---

## 📋 Información de contacto

**Grupo SDM - Mayorista de muebles y decoración**
- 🌐 Web: https://gruposdm.com
- 📧 Email: comercial@gruposdm.com
- ☎️ Teléfono: 952 426 920
- 📱 WhatsApp: 663 883 455 / 663 813 157
- 📍 Dirección: Calle Ignacio Aldecoa, 15, 29004 Málaga

## ⚠️ IMPORTANTE: Dropshipping Confirmado

✅ **Grupo SDM SÍ hace dropshipping directo**

Según su web oficial:
> "Envíos directos a tu cliente - Hacemos envíos sin intermediarios, directos a tu cliente con tus datos de distribuidor."

**Ventajas:**
- Envían directamente a tus clientes finales
- No incluyen sus precios mayoristas
- Pueden poner tus datos como distribuidor
- Envíos rápidos en 24-48h para productos en stock

**Lo que debes hacer:**
1. Al recibir un pedido en INMOALIA, contacta con Grupo SDM
2. Proporciona: SKUs, cantidades, dirección de envío de tu cliente
3. Indica que el envío debe ir con tus datos (INMOALIA)
4. Ellos envían directamente sin que tú tengas que tocar la mercancía

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

⚠️ **IMPORTANTE:** Grupo SDM no tiene stock en tiempo real por API

**Mejores prácticas:**
1. Contacta con ellos para saber qué tienen disponible
2. Actualiza el stock en la base de datos manualmente
3. Si un producto se agota, márcalo como `is_active = false`
4. Revisa stock semanalmente (llamada o email)
5. Los productos en su web con "CONSULTAR" pueden tener stock limitado

**Tiempos de envío:**
- **Productos en stock**: 24-48h
- **Productos bajo demanda**: Consultar plazo con Grupo SDM
- **Productos fabricados a medida**: NO admiten devolución

## 🛡️ Garantía y devoluciones

### Garantía de 3 años

Todos los productos tienen **garantía de 3 años** según Real Decreto-ley 7/2021:

✅ **Cubre:**
- Defectos de fabricación
- Vicios ocultos del producto
- Productos que no cumplen las especificaciones

❌ **NO cubre:**
- Mal uso o mantenimiento inadecuado
- Componentes perecederos o sometidos a desgaste normal:
  - Tapicerías, espumas, plásticos
  - Bases, ruedas, herrajes, soportes
  - Hidráulicos, mandos, mecanismos
  - Elementos eléctricos, pistones
  - Otros componentes de desgaste

### Política de devoluciones

⚠️ **Condiciones estrictas:**

1. **Autorización previa obligatoria:**
   - Solo se admiten devoluciones con autorización por escrito de INMOALIA
   - El cliente debe solicitar devolución a info@inmoalia.com
   - Tú solicitas autorización a Grupo SDM (comercial@gruposdm.com o logistica@gruposdm.com)

2. **Embalaje original obligatorio:**
   - No se admiten devoluciones sin el embalaje original
   - El producto debe estar sin usar y en perfecto estado

3. **Productos excluidos de devolución:**
   - Productos fabricados bajo demanda
   - Productos personalizados
   - Productos con desprecintado (según categoría)

4. **Procedimiento:**
   ```
   Cliente solicita devolución → INMOALIA revisa caso → 
   Solicitas autorización a Grupo SDM → Te autorizan → 
   Das autorización al cliente → Cliente envía producto → 
   Verificas estado → Proceso reembolso
   ```

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

**Tiempos de entrega:**
- ✅ **24-48 horas** para productos en stock
- 📍 Envíos a toda España Peninsular
- 🚫 Baleares, Canarias, Ceuta y Melilla: consultar condiciones

**Costes actuales (ya configurados en `lib/shop/shipping.ts`):**

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

✅ **SÍ, Grupo SDM hace dropshipping directo** (ver sección anterior)

Pregúntales para confirmar:
1. ✅ Enviar directamente a tus clientes (CONFIRMADO)
2. ✅ No incluir albarán con sus precios (CONFIRMADO - "con tus datos de distribuidor")
3. ❓ Poner tu marca/logo en el paquete (consultar)
4. ❓ Condiciones especiales para dropshipping (consultar descuentos por volumen)

## 📦 Procedimiento de recepción (Referencia interna)

### Información importante de Grupo SDM (para TI como dropshipper):

1. **Revisión obligatoria a la descarga:**
   - Grupo SDM requiere que se revise el paquete al recibirlo
   - Si hay daños, debe indicarse en el albarán de la agencia
   - Esto es un requisito de su seguro de transporte

2. **Plazo de 24 horas para reclamaciones a Grupo SDM:**
   - Si un cliente reporta daños, TÚ tienes 24h para reportar a Grupo SDM
   - Email: logistica@gruposdm.com
   - Incluir: fotos, descripción, número de envío

3. **Los envíos de Grupo SDM van asegurados:**
   - Cubren daños de transporte
   - Pero necesitan el procedimiento correcto (reporte en 24h)

4. **Embalaje original obligatorio:**
   - Grupo SDM no acepta devoluciones sin embalaje original
   - Por eso pedimos a los clientes conservarlo

5. **Entrega en planta baja/portería:**
   - El transportista de Grupo SDM solo entrega en planta baja
   - No sube a pisos ni áticos
   - No mencionar esto al cliente a menos que pregunte

### Cómo manejar incidencias de clientes:

**Si un cliente reporta daños en el pedido:**

1. Pídele fotos del daño y del embalaje
2. Verifica que fue en las 48h tras recepción (para el cliente)
3. Contacta a Grupo SDM en 24h: logistica@gruposdm.com
4. Grupo SDM gestiona con su seguro
5. Tú gestionas al cliente (reembolso, reenvío, etc.)

**Siempre bajo marca INMOALIA, nunca menciones Grupo SDM al cliente.**

## 📝 Checklist semanal

- [ ] Revisar stock de productos más vendidos (llamada/email a Grupo SDM)
- [ ] Actualizar precios si Grupo SDM los cambia
- [ ] Procesar pedidos pendientes (WhatsApp/Email a comercial@gruposdm.com)
- [ ] Actualizar tracking de envíos en Supabase
- [ ] Revisar incidencias de clientes (daños en transporte, 24h)
- [ ] Contactar Grupo SDM para novedades del catálogo
- [ ] Añadir nuevos productos al catálogo
- [ ] Verificar que emails de confirmación incluyen instrucciones de recepción
- [ ] Revisar devoluciones pendientes y solicitar autorizaciones

## 📧 Comunicación con clientes

### Email de confirmación de pedido

El sistema ya envía automáticamente un email profesional. Incluye:

- ✅ Número de pedido
- ✅ Resumen de productos
- ✅ Dirección de entrega
- ✅ Total pagado
- ✅ Tiempo estimado: 24-48h
- ✅ Aviso simple: revisar paquete al recibirlo y conservar embalaje

**NUNCA mencionar:**
- ❌ Grupo SDM o cualquier proveedor
- ❌ "Dropshipping" o "mayorista"
- ❌ Procedimientos de albarán detallados
- ❌ "Planta baja/portería" (es obvio, no hace falta decirlo)
- ❌ Detalles logísticos internos

### Email de envío con tracking

Automático cuando actualizas el tracking en Supabase:

- ✅ Número de seguimiento
- ✅ Enlace de tracking (si disponible)
- ✅ Tiempo estimado de entrega
- ✅ Aviso simple sobre recepción

**Marca INMOALIA siempre.**

## 🆘 Soporte

Si tienes dudas:
1. Contacta con Grupo SDM directamente
2. Revisa esta guía
3. Consulta el código en `lib/providers/grupo-sdm.ts`
