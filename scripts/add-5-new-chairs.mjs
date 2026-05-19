/**
 * Agregar 5 nuevas sillas de oficina económicas
 * Precio: 30-45€ coste + 50€ margen = 80-95€ venta
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const NEW_PRODUCTS = [
  {
    name: 'Sillón de Oficina FISS NEW Negro con Malla y Tejido Negro',
    slug: 'sillon-oficina-fiss-new-negro-malla-tejido-negro',
    description: 'Sillón de oficina FISS NEW en color negro con diseño moderno y funcional. Incorpora respaldo de malla transpirable y asiento acolchado en tejido negro de alta resistencia. Sistema basculante que permite regular la inclinación para mayor confort durante largas jornadas de trabajo. Estructura robusta con base de cinco ruedas para estabilidad y movilidad. Regulación de altura mediante pistón de gas. Ideal para oficinas, estudios y espacios de teletrabajo. Máximo confort ergonómico a precio competitivo.',
    price: 80.60,
    stock: 999,
    is_active: true,
    category: 'sillas',
    images: [
      'https://gruposdm.com/23030-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23031-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23032-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23033-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23034-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23035-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/23036-large_default/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.jpg'
    ],
    supplier_sku: '794.SFINGMTNE',
    supplier: 'gruposdm'
  },
  {
    name: 'Sillón de Oficina FISS NEW Blanco con Malla y Tejido Verde',
    slug: 'sillon-oficina-fiss-new-blanco-malla-tejido-verde',
    description: 'Sillón de oficina FISS NEW en elegante combinación blanco y verde. Diseño juvenil y moderno perfecto para espacios contemporáneos. Respaldo de malla transpirable que mantiene la espalda fresca durante todo el día. Asiento tapizado en tejido verde resistente y acolchado para máximo confort. Sistema de regulación de altura mediante pistón neumático. Mecanismo basculante que permite inclinar el respaldo. Brazos fijos integrados para apoyo adicional. Base con cinco ruedas giratorias para fácil desplazamiento. Ideal para oficina en casa, estudios creativos y espacios de trabajo modernos.',
    price: 83.15,
    stock: 999,
    is_active: true,
    category: 'sillas',
    images: [
      'https://gruposdm.com/23020-large_default/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/23021-large_default/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/23022-large_default/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/23023-large_default/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/23024-large_default/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.jpg'
    ],
    supplier_sku: '794.SFIBGMTVP',
    supplier: 'gruposdm'
  },
  {
    name: 'Sillón de Oficina RISLEY Negro con Malla Negra y Tejido Rojo Deportivo',
    slug: 'sillon-oficina-risley-negro-malla-negra-tejido-rojo',
    description: 'Sillón de oficina RISLEY con diseño deportivo en negro y rojo. Estilo gaming ideal para jóvenes profesionales y gamers. Respaldo de malla negra transpirable que garantiza ventilación óptima. Asiento tapizado en tejido rojo de alto gramaje con acolchado firme. Estructura negra robusta con acabados de calidad. Sistema de regulación de altura mediante pistón de gas certificado. Brazos fijos integrados para soporte ergonómico. Base con cinco ruedas de nylon para proteger suelos. Diseño moderno que combina estética deportiva con funcionalidad profesional. Perfecto para oficina, gaming y espacios de trabajo creativos.',
    price: 87.50,
    stock: 999,
    is_active: true,
    category: 'sillas',
    images: [
      'https://gruposdm.com/22309-large_default/sillon-de-oficina-risley-negro-malla-negra-tejido-rojo.jpg',
      'https://gruposdm.com/22310-large_default/sillon-de-oficina-risley-negro-malla-negra-tejido-rojo.jpg'
    ],
    supplier_sku: '794.SRISNNRO',
    supplier: 'gruposdm'
  },
  {
    name: 'Sillón de Oficina CLENT Blanco con Malla y Tejido Verde Moderno',
    slug: 'sillon-oficina-clent-blanco-malla-tejido-verde',
    description: 'Sillón de oficina CLENT con diseño contemporáneo en blanco y verde. Perfecta fusión de estilo y ergonomía para espacios de trabajo modernos. Respaldo de malla blanca que favorece la circulación de aire y previene la sudoración. Asiento tapizado en tejido verde de alta densidad con espuma de 8cm de grosor. Estructura blanca con acabado mate elegante. Sistema de elevación mediante pistón de gas clase 4. Brazos integrados para apoyo natural de los antebrazos. Base con cinco ruedas giratorias para máxima movilidad. Ideal para oficinas, coworking, estudios y despachos modernos que buscan un toque de color.',
    price: 87.20,
    stock: 999,
    is_active: true,
    category: 'sillas',
    images: [
      'https://gruposdm.com/22463-large_default/sillon-de-oficina-clent-blanco-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/22464-large_default/sillon-de-oficina-clent-blanco-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/22465-large_default/sillon-de-oficina-clent-blanco-malla-y-tejido-verde.jpg',
      'https://gruposdm.com/22466-large_default/sillon-de-oficina-clent-blanco-malla-y-tejido-verde.jpg'
    ],
    supplier_sku: '762.SCLBGMTVE',
    supplier: 'gruposdm'
  },
  {
    name: 'Sillón Ejecutivo de Oficina MELLAC Alto Negro con Malla y Asiento Negro',
    slug: 'sillon-oficina-mellac-alto-negro-malla-asiento-negro',
    description: 'Sillón ejecutivo de oficina MELLAC de respaldo alto en elegante negro total. Diseño premium con acabados profesionales ideal para despachos y oficinas ejecutivas. Respaldo alto de malla negra con soporte lumbar integrado que favorece la postura correcta. Asiento negro de gran tamaño tapizado en tejido de alto gramaje con acolchado extra confortable. Reposacabezas ajustable para mayor relajación cervical. Brazos acolchados regulables en altura. Mecanismo sincro que sincroniza el movimiento del respaldo y asiento. Base metálica reforzada con ruedas de goma silenciosas. Pistón de gas clase 4 certificado para soportes de hasta 120kg. La opción premium en sillas ergonómicas a precio competitivo.',
    price: 95.00,
    stock: 999,
    is_active: true,
    category: 'sillas',
    images: [
      'https://gruposdm.com/37762-large_default/sillon-de-oficina-mellac-alto-negro-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/37763-large_default/sillon-de-oficina-mellac-alto-negro-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/37764-large_default/sillon-de-oficina-mellac-alto-negro-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/37765-large_default/sillon-de-oficina-mellac-alto-negro-malla-y-asiento-negro.jpg'
    ],
    supplier_sku: '762.SMELLNMNE',
    supplier: 'gruposdm'
  }
]

async function addProducts() {
  console.log('🪑 AGREGANDO 5 NUEVAS SILLAS DE OFICINA\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  let added = 0
  let errors = 0
  
  for (const product of NEW_PRODUCTS) {
    console.log(`\n📦 ${product.name}`)
    console.log(`   Slug: ${product.slug}`)
    console.log(`   Precio: ${product.price}€`)
    console.log(`   Imágenes: ${product.images.length}`)
    console.log(`   SKU: ${product.supplier_sku}`)
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        errors++
      } else {
        console.log(`   ✅ Producto agregado correctamente`)
        added++
      }
    } catch (err) {
      console.log(`   ❌ Excepción: ${err.message}`)
      errors++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Productos agregados: ${added}`)
  console.log(`   ❌ Errores: ${errors}`)
  console.log(`   🖼️  Total imágenes: ${NEW_PRODUCTS.reduce((acc, p) => acc + p.images.length, 0)}`)
  console.log(`   💰 Rango precios: ${Math.min(...NEW_PRODUCTS.map(p => p.price))}€ - ${Math.max(...NEW_PRODUCTS.map(p => p.price))}€`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  if (added === NEW_PRODUCTS.length) {
    console.log('✅ TODOS LOS PRODUCTOS AGREGADOS CON ÉXITO')
    console.log('📝 Total productos en catálogo: 25')
    console.log('🚀 Listo para deploy a producción\n')
  }
}

addProducts().catch(console.error)
