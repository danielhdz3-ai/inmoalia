/**
 * Actualización manual de URLs de imágenes desde Grupo SDM
 * Las URLs fueron extraídas manualmente del navegador autenticado
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mapeo completo de productos con sus URLs de imágenes correctas de Grupo SDM
const PRODUCT_IMAGES = {
  // Sillón GRAZ - Blanco y Negro (ya extraído del navegador)
  'sillon-ergonomico-graz-alto-blanco-y-negro': {
    sku: '794.SGRAZANNE',
    images: [
      'https://gruposdm.com/22802-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/22803-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/22804-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'
    ]
  },
  
  // Sillón CLAYTON - Negro (ya lo extrajimos antes)
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': {
    sku: '794.SCLAYNNNE',
    images: [
      'https://gruposdm.com/22319-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg',
      'https://gruposdm.com/22320-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg'
    ]
  },
  
  // PORTIMAO (lo vimos en los resultados)
  'sillon-gaming-portimao-racing-amarillo-y-negro': {
    sku: '794.SPORSRAM',
    images: [
      'https://gruposdm.com/23329-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
      'https://gruposdm.com/23330-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg'
    ]
  },
  
  // ARANJUEZ (lo vimos en los resultados)
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': {
    sku: '794.SARANEGRI',
    images: [
      'https://gruposdm.com/33563-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
      'https://gruposdm.com/33564-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg'
    ]
  }
}

async function updateProductImages() {
  console.log('🖼️  ACTUALIZANDO IMÁGENES DE PRODUCTOS\n')
  
  const results = {
    updated: 0,
    errors: 0,
    total: Object.keys(PRODUCT_IMAGES).length
  }
  
  for (const [slug, data] of Object.entries(PRODUCT_IMAGES)) {
    console.log(`\n📦 Procesando: ${slug}`)
    console.log(`   SKU: ${data.sku}`)
    console.log(`   Imágenes: ${data.images.length}`)
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ images: data.images })
        .eq('slug', slug)
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        results.errors++
      } else {
        console.log(`   ✅ Actualizado correctamente`)
        results.updated++
      }
    } catch (err) {
      console.log(`   ❌ Excepción: ${err.message}`)
      results.errors++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Actualizados: ${results.updated}`)
  console.log(`   ❌ Errores: ${results.errors}`)
  console.log(`   📦 Total: ${results.total}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('✨ ACTUALIZACIÓN COMPLETADA\n')
  console.log('⚠️  NOTA: Este script tiene solo las primeras 4 sillas.')
  console.log('   Ejecutar en navegador para extraer el resto de productos.\n')
}

updateProductImages().catch(console.error)
