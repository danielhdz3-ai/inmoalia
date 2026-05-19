/**
 * Convertir las 9 imágenes externas a proxy sin descargarlas
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔄 CONVIRTIENDO IMÁGENES EXTERNAS A PROXY\n')

// Los 3 productos con imágenes externas
const productsToUpdate = [
  'sillon-ejecutivo-bernay-malla-negro',
  'sillon-ergonomico-graz-blanco-negro',
  'sillon-gaming-portimao-amarillo-negro'
]

for (const slug of productsToUpdate) {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, name, images')
    .eq('slug', slug)
    .single()

  if (fetchError) {
    console.log(`❌ ${slug}: ${fetchError.message}`)
    continue
  }

  // Convertir URLs externas a proxy
  const proxyImages = product.images.map(imageUrl => {
    if (imageUrl.startsWith('http')) {
      // Convertir a URL de proxy
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    }
    return imageUrl
  })

  // Actualizar en base de datos
  const { error: updateError } = await supabase
    .from('products')
    .update({ images: proxyImages })
    .eq('id', product.id)

  if (updateError) {
    console.log(`❌ ${product.name}: ${updateError.message}`)
  } else {
    console.log(`✅ ${product.name}`)
    console.log(`   ${proxyImages.length} imágenes convertidas a proxy`)
  }
}

console.log('\n🎉 Conversión completada')
console.log('   Las imágenes ahora se sirven vía proxy (sin almacenamiento permanente)')
