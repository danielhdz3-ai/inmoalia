/**
 * ACTUALIZACIÓN COMPLETA DE IMÁGENES - 10 PRODUCTOS
 * Imágenes extraídas de Grupo SDM (sesión autenticada)
 * Ejecutar: $env:NEXT_PUBLIC_SUPABASE_URL="https://fxdebyxhcwyagsjvddhc.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGVieXhoY3d5YWdzanZkZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMTYyNiwiZXhwIjoyMDkzMTk3NjI2fQ.OUOjK9JYkpqo952CTTpoW58IoXUfp2buBi87no1FruQ"; node scripts/update-all-images-final.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRODUCT_IMAGES = {
  // ===== SILLAS (4 productos) =====
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
  ],

  // ===== MESAS (3 productos) =====
  'conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao': [
    'https://gruposdm.com/36353-large_default/mesas-de-oficina-studio-136-y-studio-90-2-cajones-bilaminado-miel-y-cacao-136-x-150-cms.jpg',
    'https://gruposdm.com/36354-large_default/mesas-de-oficina-studio-136-y-studio-90-2-cajones-bilaminado-miel-y-cacao-136-x-150-cms.jpg',
    'https://gruposdm.com/36355-large_default/mesas-de-oficina-studio-136-y-studio-90-2-cajones-bilaminado-miel-y-cacao-136-x-150-cms.jpg',
    'https://gruposdm.com/36356-large_default/mesas-de-oficina-studio-136-y-studio-90-2-cajones-bilaminado-miel-y-cacao-136-x-150-cms.jpg',
    'https://gruposdm.com/36357-large_default/mesas-de-oficina-studio-136-y-studio-90-2-cajones-bilaminado-miel-y-cacao-136-x-150-cms.jpg'
  ],
  'mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada': [
    'https://gruposdm.com/36539-large_default/mesa-de-oficina-basilea-vidrio-templado-negro-160-x-80-cms.jpg'
  ],
  'mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco': [
    'https://gruposdm.com/36545-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg',
    'https://gruposdm.com/36546-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg'
  ],

  // ===== ALMACENAMIENTO (3 productos) =====
  'armario-arezzo-160-alto-con-2-puertas-blanco-y-roble': [
    'https://gruposdm.com/38599-large_default/armario-arezzo-160-alto-2-puertas-altas-blanco-y-roble.jpg',
    'https://gruposdm.com/38600-large_default/armario-arezzo-160-alto-2-puertas-altas-blanco-y-roble.jpg',
    'https://gruposdm.com/38601-large_default/armario-arezzo-160-alto-2-puertas-altas-blanco-y-roble.jpg'
  ],
  'archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao': [
    'https://gruposdm.com/36362-large_default/archivador-studio-3-gavetas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36363-large_default/archivador-studio-3-gavetas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36364-large_default/archivador-studio-3-gavetas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36365-large_default/archivador-studio-3-gavetas-bilaminado-miel-y-cacao.jpg'
  ],
  'armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao': [
    'https://gruposdm.com/36358-large_default/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36359-large_default/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36360-large_default/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.jpg',
    'https://gruposdm.com/36361-large_default/armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao.jpg'
  ]
}

// Productos que NO se encontraron en Grupo SDM (10 productos restantes):
// - sillon-ejecutivo-bernay-alto-malla-negra
// - sillon-de-oficina-clayton-blanco-malla-gris-y-tejido-gris
// - sillon-de-oficina-utrecht-alto-negro-malla
// - mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble
// - mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro
// - cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035
// - armario-metalico-olimpo-puertas-correderas-gris-ral-7035
// - lampara-de-pie-omega-cromada-con-base-de-marmol-negro
// - lampara-de-pie-italica-diseno-moderno-acrilico
// - sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra

async function updateProductImages() {
  console.log('🖼️  ACTUALIZACIÓN COMPLETA DE IMÁGENES DE PRODUCTOS\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  let updated = 0
  let errors = 0
  let totalImages = 0
  
  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    totalImages += images.length
    console.log(`\n📦 ${slug}`)
    console.log(`   Imágenes: ${images.length}`)
    
    images.forEach((url, i) => {
      console.log(`      ${i + 1}. ${url.substring(url.lastIndexOf('/') + 1)}`)
    })
    
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
  console.log('📊 RESUMEN FINAL:')
  console.log(`   ✅ Productos actualizados: ${updated}/20`)
  console.log(`   🖼️  Total de imágenes: ${totalImages}`)
  console.log(`   ❌ Errores: ${errors}`)
  console.log(`   ⏸️  Productos pendientes: ${20 - updated} (no encontrados en Grupo SDM)`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('📝 PRODUCTOS PENDIENTES (no encontrados en Grupo SDM):')
  console.log('   1. sillon-ejecutivo-bernay-alto-malla-negra')
  console.log('   2. sillon-de-oficina-clayton-blanco-malla-gris-y-tejido-gris')
  console.log('   3. sillon-de-oficina-utrecht-alto-negro-malla')
  console.log('   4. mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble')
  console.log('   5. mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro')
  console.log('   6. cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035')
  console.log('   7. armario-metalico-olimpo-puertas-correderas-gris-ral-7035')
  console.log('   8. lampara-de-pie-omega-cromada-con-base-de-marmol-negro')
  console.log('   9. lampara-de-pie-italica-diseno-moderno-acrilico')
  console.log('   10. sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra\n')
  
  console.log('💡 RECOMENDACIÓN:')
  console.log('   - Buscar estos productos manualmente en Grupo SDM')
  console.log('   - Verificar si han cambiado de nombre o fueron descontinuados')
  console.log('   - Contactar al proveedor para confirmar disponibilidad\n')
}

updateProductImages().catch(console.error)
