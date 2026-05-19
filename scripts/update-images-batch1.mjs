/**
 * Imágenes extraídas de Grupo SDM - ACTUALIZACIÓN BATCH 1
 * Ejecutar con: $env:NEXT_PUBLIC_SUPABASE_URL="https://fxdebyxhcwyagsjvddhc.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGVieXhoY3d5YWdzanZkZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMTYyNiwiZXhwIjoyMDkzMTk3NjI2fQ.OUOjK9JYkpqo952CTTpoW58IoXUfp2buBi87no1FruQ"; node scripts/update-images-batch1.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRODUCT_IMAGES = {
  'sillon-ergonomico-graz-alto-blanco-y-negro': [
    'https://gruposdm.com/22806-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/22807-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/22808-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'
  ],
  'sillon-gaming-portimao-racing-amarillo-y-negro': [
    'https://gruposdm.com/23329-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
    'https://gruposdm.com/23330-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
    'https://gruposdm.com/23331-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
    'https://gruposdm.com/23332-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg',
    'https://gruposdm.com/23333-large_default/sillon-de-oficina-portimao-racing-similpiel-amarilla-y-negra.jpg'
  ],
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': [
    'https://gruposdm.com/33563-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33564-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33565-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33566-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33567-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33568-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33569-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg',
    'https://gruposdm.com/33570-large_default/sillon-de-oficina-aranjuez-alto-gris-ergonomico-multifuncion-malla-y-asiento-negro.jpg'
  ],
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': [
    'https://gruposdm.com/22319-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/22320-large_default/sillon-de-oficina-clayton-negro-malla-y-tejido-negro.jpg'
  ]
}

async function updateProductImages() {
  console.log('🖼️  ACTUALIZANDO IMÁGENES DE PRODUCTOS - BATCH 1\n')
  
  let updated = 0
  let errors = 0
  
  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    console.log(`\n📦 ${slug}`)
    console.log(`   Imágenes: ${images.length}`)
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ images })
        .eq('slug', slug)
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        errors++
      } else {
        console.log(`   ✅ Actualizado`)
        updated++
      }
    } catch (err) {
      console.log(`   ❌ Excepción: ${err.message}`)
      errors++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN BATCH 1:')
  console.log(`   ✅ Actualizados: ${updated}`)
  console.log(`   ❌ Errores: ${errors}`)
  console.log(`   📦 Total: ${updated + errors}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

updateProductImages().catch(console.error)
