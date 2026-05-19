import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 VERIFICANDO IMÁGENES Y STOCK DE PRODUCTOS\n')

const { data: products, error } = await supabase
  .from('products')
  .select('id, name, slug, images, stock, supplier_sku')
  .eq('supplier', 'gruposdm')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(10)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📦 Productos encontrados: ${products.length}\n`)

for (const product of products) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📦 ${product.name}`)
  console.log(`   Slug: ${product.slug}`)
  console.log(`   SKU: ${product.supplier_sku}`)
  console.log(`   Stock: ${product.stock}`)
  console.log(`   Imágenes: ${product.images?.length || 0}`)
  if (product.images && product.images.length > 0) {
    product.images.forEach((img, i) => {
      console.log(`      ${i + 1}. ${img}`)
    })
  } else {
    console.log(`      ⚠️  Sin imágenes`)
  }
  console.log()
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
