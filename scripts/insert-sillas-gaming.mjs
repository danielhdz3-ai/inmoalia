#!/usr/bin/env node
/**
 * Script para agregar 3 sillas de oficina gaming/ergonómicas desde Grupo SDM
 * Productos con descuentos activos y alto stock
 * Margen: +40-50€ sobre precio proveedor
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Faltan variables de entorno SUPABASE')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const productos = [
  {
    sku: 'INMO-SILLA-PORTIMAO-AMARILLO',
    name: 'Sillón Gaming PORTIMAO Racing Amarillo y Negro',
    slug: 'sillon-gaming-portimao-amarillo-negro',
    description: `Sillón de oficina gaming PORTIMAO con diseño racing deportivo en similpiel amarilla y negra de alta calidad. Ideal para gamers, streamers y largas jornadas de trabajo.

Características principales:
- Diseño racing deportivo con detalles en amarillo vibrante
- Respaldo alto ergonómico con soporte lumbar integrado
- Reposabrazos acolchados ajustables en altura
- Base de estrella cromada con ruedas de 60mm silenciosas
- Mecanismo basculante con regulación de tensión
- Pistón de gas certificado clase 4 (hasta 120kg)
- Similpiel premium resistente al desgaste y fácil de limpiar

Perfecta para quienes buscan comodidad y estilo gaming sin sacrificar el profesionalismo. El contraste amarillo-negro aporta energía a cualquier setup. Estructura robusta que garantiza estabilidad durante sesiones intensas.

Ideal para: Gaming, streaming, diseño gráfico, programación, estudios musicales, home office dinámico.`,
    price: 95.00, // PVP final (+40€ margen)
    cost_price: 55.30, // Precio proveedor
    stock: 999,
    category: 'sillas',
    subcategory: 'gaming',
    supplier: 'Grupo SDM',
    supplier_sku: '712-SPORSAMNE',
    images: [
      'https://gruposdm.com/71220-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
      'https://gruposdm.com/71221-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
      'https://gruposdm.com/71222-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg'
    ],
    dimensions: { width: 62, height: 120, depth: 62 },
    material: 'Similpiel premium',
    color: 'Amarillo y Negro',
    weight_kg: 18,
    tags: ['gaming', 'racing', 'ergonómica', 'ajustable', 'amarillo', 'deportiva'],
    is_active: true,
    is_featured: true,
    meta_title: 'Sillón Gaming PORTIMAO Racing Amarillo y Negro | INMOALIA',
    meta_desc: 'Sillón gaming racing PORTIMAO amarillo y negro. Diseño deportivo, similpiel premium, respaldo ergonómico. Ideal para gamers y largas jornadas. 95€',
  },
  {
    sku: 'INMO-SILLA-BERNAY-NEGRO',
    name: 'Sillón Ejecutivo BERNAY Alto Malla Negra',
    slug: 'sillon-ejecutivo-bernay-malla-negro',
    description: `Sillón ejecutivo BERNAY de respaldo alto con malla transpirable y asiento acolchado negro. Elegancia profesional y máxima comodidad para tu oficina.

Características principales:
- Respaldo alto en malla transpirable de alta densidad
- Asiento ergonómico con espuma de alta densidad 50kg/m³
- Reposacabezas ajustable en altura e inclinación
- Reposabrazos fijos con acabado negro mate
- Mecanismo sincronizado de última generación
- Base cromada de 5 radios con ruedas para parquet
- Acabado negro elegante totalmente coordinado

Diseño profesional que combina ergonomía avanzada con estética corporativa moderna. La malla transpirable mantiene la espalda fresca durante toda la jornada, mientras que el asiento acolchado garantiza comodidad sin comprometer la postura.

Ideal para: Ejecutivos, directores, despachos profesionales, oficinas corporativas, consultas médicas, estudios jurídicos.`,
    price: 99.00, // PVP final (+45€ margen)
    cost_price: 54.00, // Precio proveedor
    stock: 999,
    category: 'sillas',
    subcategory: 'ejecutivas',
    supplier: 'Grupo SDM',
    supplier_sku: '762-SBERNAMNE',
    images: [
      'https://gruposdm.com/76214-large_default/sillon-de-oficina-bernay-alto-negro-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/76215-large_default/sillon-de-oficina-bernay-alto-negro-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/76216-large_default/sillon-de-oficina-bernay-alto-negro-malla-y-asiento-negro.jpg'
    ],
    dimensions: { width: 64, height: 118, depth: 64 },
    material: 'Malla transpirable y espuma',
    color: 'Negro',
    weight_kg: 16.5,
    tags: ['ejecutiva', 'malla', 'transpirable', 'ergonómica', 'profesional', 'negro'],
    is_active: true,
    is_featured: false,
    meta_title: 'Sillón Ejecutivo BERNAY Malla Negra Transpirable | INMOALIA',
    meta_desc: 'Sillón ejecutivo BERNAY con respaldo alto de malla transpirable. Diseño profesional, asiento ergonómico, reposacabezas ajustable. 99€',
  },
  {
    sku: 'INMO-SILLA-GRAZ-BLANCO',
    name: 'Sillón Ergonómico GRAZ Alto Blanco y Negro',
    slug: 'sillon-ergonomico-graz-blanco-negro',
    description: `Sillón ergonómico GRAZ de respaldo alto con combinación moderna de blanco y negro. Malla transpirable y tejido técnico para máximo confort durante toda la jornada.

Características principales:
- Respaldo alto en malla blanca transpirable ultra-fresca
- Asiento en tejido técnico negro resistente y cómodo
- Diseño bicolor moderno blanco-negro muy versátil
- Reposacabezas ergonómico ajustable en altura
- Reposabrazos regulables en 2D (altura y profundidad)
- Mecanismo sincronizado con bloqueo multiposición
- Base robusta con acabado cromado y ruedas de 65mm

El contraste blanco-negro aporta luminosidad y modernidad a cualquier espacio de trabajo. La combinación de malla transpirable en el respaldo y tejido técnico en el asiento ofrece el equilibrio perfecto entre ventilación y comodidad.

Ideal para: Oficinas modernas, espacios colaborativos, coworking, home office contemporáneo, startups, estudios de arquitectura.`,
    price: 109.00, // PVP final (+51€ margen)
    cost_price: 57.75, // Precio proveedor
    stock: 999,
    category: 'sillas',
    subcategory: 'ergonomicas',
    supplier: 'Grupo SDM',
    supplier_sku: '794-SGRBMTNE',
    images: [
      'https://gruposdm.com/79417-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/79418-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/79419-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'
    ],
    dimensions: { width: 65, height: 122, depth: 65 },
    material: 'Malla y tejido técnico',
    color: 'Blanco y Negro',
    weight_kg: 17,
    tags: ['ergonómica', 'blanco', 'moderno', 'malla', 'bicolor', 'ajustable'],
    is_active: true,
    is_featured: true,
    meta_title: 'Sillón Ergonómico GRAZ Blanco y Negro Malla | INMOALIA',
    meta_desc: 'Sillón ergonómico GRAZ bicolor blanco-negro. Malla transpirable, tejido técnico, diseño moderno. Ajustable y cómodo. 109€',
  },
]

async function insertarProductos() {
  console.log('🪑 INICIANDO INSERCIÓN DE SILLAS GAMING/ERGONÓMICAS\n')
  console.log(`Total a insertar: ${productos.length} productos\n`)

  let insertados = 0
  let errores = 0

  for (const producto of productos) {
    try {
      console.log(`📦 Insertando: ${producto.name}`)
      console.log(`   SKU Proveedor: ${producto.supplier_sku}`)
      console.log(`   Precio proveedor: ${producto.cost_price}€`)
      console.log(`   Precio venta: ${producto.price}€`)
      console.log(`   Margen: +${(producto.price - producto.cost_price).toFixed(2)}€`)

      const { data, error } = await supabase
        .from('products')
        .insert([producto])
        .select()

      if (error) {
        console.error(`   ❌ ERROR: ${error.message}\n`)
        errores++
        continue
      }

      console.log(`   ✅ Insertado correctamente`)
      console.log(`   🔗 Slug: ${producto.slug}\n`)
      insertados++
    } catch (err) {
      console.error(`   ❌ EXCEPCIÓN: ${err.message}\n`)
      errores++
    }
  }

  console.log('━'.repeat(60))
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Insertados: ${insertados}`)
  console.log(`   ❌ Errores: ${errores}`)
  console.log(`   📦 Total: ${productos.length}`)
  console.log('━'.repeat(60))

  if (insertados > 0) {
    console.log('\n✨ IMPORTACIÓN COMPLETADA')
    console.log(`\n🔍 Verificar en: https://www.inmoalia.com/categorias/sillas`)
  }
}

insertarProductos().catch((err) => {
  console.error('💥 ERROR FATAL:', err)
  process.exit(1)
})
