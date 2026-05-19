/**
 * Verificar estado de todas las imágenes en la base de datos
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 VERIFICACIÓN COMPLETA DE IMÁGENES\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: products, error } = await supabase
  .from('products')
  .select('id, name, slug, images, is_active')
  .eq('is_active', true)
  .order('name')

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

let totalProducts = 0
let productsWithImages = 0
let productsWithoutImages = 0
let totalImages = 0
let localImages = 0
let externalImages = 0

const productsWithIssues = []

for (const product of products) {
  totalProducts++
  
  if (!product.images || product.images.length === 0) {
    productsWithoutImages++
    productsWithIssues.push({
      name: product.name,
      slug: product.slug,
      issue: '❌ SIN IMÁGENES'
    })
    continue
  }
  
  productsWithImages++
  totalImages += product.images.length
  
  const hasLocal = product.images.some(img => img.startsWith('/imagenes/'))
  const hasExternal = product.images.some(img => img.startsWith('http'))
  
  if (hasLocal) localImages += product.images.filter(img => img.startsWith('/imagenes/')).length
  if (hasExternal) externalImages += product.images.filter(img => img.startsWith('http')).length
  
  console.log(`✅ ${product.name}`)
  console.log(`   ${product.images.length} imágenes | ${hasLocal ? 'Locales' : 'Externas'}`)
  console.log(`   ${product.slug}`)
  console.log()
}

if (productsWithIssues.length > 0) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  PRODUCTOS CON PROBLEMAS:\n')
  productsWithIssues.forEach(p => {
    console.log(`${p.issue} - ${p.name}`)
    console.log(`   ${p.slug}\n`)
  })
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 RESUMEN FINAL:\n')
console.log(`   Total productos activos: ${totalProducts}`)
console.log(`   ✅ Con imágenes: ${productsWithImages}`)
console.log(`   ❌ Sin imágenes: ${productsWithoutImages}`)
console.log(`   📸 Total imágenes: ${totalImages}`)
console.log(`   💾 Imágenes locales: ${localImages}`)
console.log(`   🌐 Imágenes externas: ${externalImages}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

if (productsWithoutImages === 0 && externalImages === 0) {
  console.log('\n🎉 ¡PERFECTO! Todos los productos tienen imágenes locales')
} else if (productsWithoutImages === 0 && externalImages > 0) {
  console.log('\n⚠️  ADVERTENCIA: Algunos productos usan imágenes externas')
  console.log('   (podrían fallar si Grupo SDM bloquea hotlinking)')
} else {
  console.log('\n❌ ¡ATENCIÓN! Hay productos sin imágenes')
}
