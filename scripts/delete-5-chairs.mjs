/**
 * Eliminar las 5 sillas que se agregaron recientemente
 * (tienen problemas con imágenes en miniatura)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRODUCTS_TO_DELETE = [
  'sillon-oficina-fiss-new-negro-malla-tejido-negro',
  'sillon-oficina-fiss-new-blanco-malla-tejido-verde',
  'sillon-oficina-risley-negro-malla-negra-tejido-rojo',
  'sillon-oficina-clent-blanco-malla-tejido-verde',
  'sillon-oficina-mellac-alto-negro-malla-asiento-negro'
]

async function deleteProducts() {
  console.log('🗑️  ELIMINANDO 5 SILLAS PROBLEMÁTICAS\n')
  
  let deleted = 0
  let errors = 0
  
  for (const slug of PRODUCTS_TO_DELETE) {
    console.log(`📦 Eliminando: ${slug}`)
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('slug', slug)
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        errors++
      } else {
        console.log(`   ✅ Eliminado`)
        deleted++
      }
    } catch (err) {
      console.log(`   ❌ Excepción: ${err.message}`)
      errors++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Eliminados: ${deleted}`)
  console.log(`   ❌ Errores: ${errors}`)
  console.log(`   📦 Total productos en catálogo: 20`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

deleteProducts().catch(console.error)
