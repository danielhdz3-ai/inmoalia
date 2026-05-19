/**
 * Script automatizado para extraer y actualizar imágenes de productos desde Grupo SDM
 * Ejecutar: node scripts/auto-extract-images.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// URLs directas de productos en Grupo SDM (autenticación requerida)
const PRODUCT_URLS = {
  // SILLAS
  'sillon-ergonomico-graz-alto-blanco-y-negro': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.html',
  'sillon-ejecutivo-bernay-alto-malla-negra': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-bernay-alto-negro-malla-negra.html',
  'sillon-gaming-portimao-racing-amarillo-y-negro': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.html',
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.html',
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.html',
  'sillon-de-oficina-clayton-blanco-malla-gris-y-tejido-gris': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-clayton-blanco-malla-gris-tejido-gris.html',
  'sillon-de-oficina-utrecht-alto-negro-malla': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-utrecht-alto-negro-malla-negra.html',
  
  // MESAS
  'mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble.html',
  'mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada.html',
  'mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro.html',
  'mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas/mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco.html',
  'conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/modulos-de-oficina/conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao.html',
  
  // ALMACENAMIENTO
  'armario-arezzo-160-alto-con-2-puertas-blanco-y-roble': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-arezzo-160-alto-con-2-puertas-blanco-y-roble.html',
  'archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao.html',
  'cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/cajoneras/cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035.html',
  'armario-metalico-olimpo-puertas-correderas-gris-ral-7035': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-metalico-olimpo-puertas-correderas-gris-ral-7035.html',
  'armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao': 'https://gruposdm.com/es/oficinas/muebles-de-oficina/armarios/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.html',
  
  // ILUMINACIÓN
  'lampara-de-pie-omega-cromada-con-base-de-marmol-negro': 'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-de-pie-omega-cromada-con-base-de-marmol-negro.html',
  'lampara-de-pie-italica-diseno-moderno-acrilico': 'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-de-pie-italica-diseno-moderno-acrilico.html',
  
  // SOFÁS
  'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra': 'https://gruposdm.com/es/oficinas/sofas-y-sillones/sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra.html'
}

// Imágenes extraídas manualmente (CLAYTON como ejemplo)
const EXTRACTED_IMAGES = {
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': [
    'https://gruposdm.com/22319-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/22320-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg'
  ]
}

async function updateProductImages(slug, images) {
  console.log(`\n📦 Actualizando: ${slug}`)
  console.log(`   Imágenes: ${images.length}`)
  
  images.forEach((url, i) => {
    console.log(`      ${i + 1}. ${url}`)
  })
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ images })
      .eq('slug', slug)
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
      return false
    }
    
    console.log(`   ✅ Actualizado correctamente`)
    return true
  } catch (err) {
    console.log(`   ❌ Excepción: ${err.message}`)
    return false
  }
}

async function main() {
  console.log('🖼️  ACTUALIZACIÓN DE IMÁGENES DE PRODUCTOS\n')
  console.log(`📦 Total de productos a actualizar: ${Object.keys(EXTRACTED_IMAGES).length}\n`)
  
  let updated = 0
  let errors = 0
  
  for (const [slug, images] of Object.entries(EXTRACTED_IMAGES)) {
    const success = await updateProductImages(slug, images)
    if (success) updated++
    else errors++
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Actualizados: ${updated}`)
  console.log(`   ❌ Errores: ${errors}`)
  console.log(`   📦 Total: ${updated + errors}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('⚠️  PENDIENTE: Extraer imágenes de los ${Object.keys(PRODUCT_URLS).length - updated} productos restantes')
  console.log('   Usar el navegador autenticado de Grupo SDM para copiar las URLs\n')
}

main().catch(console.error)
