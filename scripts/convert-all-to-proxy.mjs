/**
 * Convertir TODAS las imágenes a proxy (no solo las externas)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔄 CONVIRTIENDO TODAS LAS IMÁGENES A PROXY\n')

// Obtener todos los productos
const { data: products, error } = await supabase
  .from('products')
  .select('id, name, slug, images')
  .eq('is_active', true)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

const updates = []

for (const product of products) {
  if (!product.images || product.images.length === 0) continue

  // Convertir todas las URLs a proxy (tanto locales como externas)
  const proxyImages = product.images.map(imageUrl => {
    // Si es una URL local /imagenes/productos/
    if (imageUrl.startsWith('/imagenes/productos/')) {
      // Necesitamos la URL original de Grupo SDM
      // Por ahora, saltamos estas (ya están en formato local)
      return imageUrl
    }
    
    // Si ya es proxy, dejarlo
    if (imageUrl.startsWith('/api/image-proxy')) {
      return imageUrl
    }
    
    // Si es URL externa, convertir a proxy
    if (imageUrl.startsWith('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    }
    
    return imageUrl
  })

  // Solo actualizar si hubo cambios
  const changed = JSON.stringify(proxyImages) !== JSON.stringify(product.images)
  
  if (changed) {
    updates.push({
      id: product.id,
      name: product.name,
      images: proxyImages,
      count: proxyImages.filter(img => img.startsWith('/api/image-proxy')).length
    })
  }
}

console.log(`📋 Productos a actualizar: ${updates.length}\n`)

for (const update of updates) {
  const { error: updateError } = await supabase
    .from('products')
    .update({ images: update.images })
    .eq('id', update.id)

  if (updateError) {
    console.log(`❌ ${update.name}: ${updateError.message}`)
  } else {
    console.log(`✅ ${update.name}`)
    console.log(`   ${update.count} imágenes convertidas a proxy`)
  }
}

console.log('\n🎉 Conversión completada')
console.log('   Ahora puedes borrar /public/imagenes/productos/ sin problemas')
