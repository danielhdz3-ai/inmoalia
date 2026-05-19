import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 VERIFICANDO TODOS LOS PRODUCTOS\n')

const { data: products, error } = await supabase
  .from('products')
  .select('id, name, slug, images, is_active, supplier')
  .eq('is_active', true)
  .order('created_at', { ascending: false })

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📦 Total productos activos: ${products.length}\n`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

let totalImages = 0
let productsWithoutImages = 0
let productsWithExternalImages = 0
const externalUrls = []

for (const product of products) {
  const imageCount = product.images?.length || 0
  totalImages += imageCount
  
  console.log(`📦 ${product.name}`)
  console.log(`   Slug: ${product.slug}`)
  console.log(`   Proveedor: ${product.supplier || 'N/A'}`)
  console.log(`   Imágenes: ${imageCount}`)
  
  if (imageCount === 0) {
    console.log(`   ⚠️  SIN IMÁGENES`)
    productsWithoutImages++
  } else {
    let hasExternal = false
    product.images.forEach((img, i) => {
      console.log(`      ${i + 1}. ${img}`)
      if (img.startsWith('http')) {
        hasExternal = true
        externalUrls.push({ product: product.slug, url: img })
      }
    })
    if (hasExternal) {
      console.log(`   ⚠️  Tiene URLs externas (hotlinking)`)
      productsWithExternalImages++
    }
  }
  console.log()
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📊 RESUMEN:`)
console.log(`   📦 Total productos: ${products.length}`)
console.log(`   🖼️  Total imágenes: ${totalImages}`)
console.log(`   ⚠️  Productos sin imágenes: ${productsWithoutImages}`)
console.log(`   ⚠️  Productos con URLs externas: ${productsWithExternalImages}`)
console.log(`   🌐 Total URLs externas: ${externalUrls.length}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

if (externalUrls.length > 0) {
  console.log(`\n⚠️  PRODUCTOS CON HOTLINKING (DEBEN DESCARGARSE):`)
  externalUrls.forEach(item => {
    console.log(`   - ${item.product}: ${item.url}`)
  })
}
