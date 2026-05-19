import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🗑️ DESACTIVANDO PRODUCTOS SIN IMÁGENES LOCALES\n')

const { data: products } = await supabase
  .from('products')
  .select('id, name, slug, images, is_active')
  .eq('is_active', true)

let desactivados = 0

for (const product of products) {
  const hasLocalImages = product.images.some(img => 
    img && img.startsWith('/imagenes/productos/') && !img.includes('api/image-proxy')
  )
  
  if (!hasLocalImages) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', product.id)
    
    if (!error) {
      console.log(`❌ Desactivado: ${product.name}`)
      desactivados++
    }
  } else {
    console.log(`✅ Mantener: ${product.name}`)
  }
}

console.log(`\n🗑️ ${desactivados} productos desactivados`)
console.log(`✅ Solo quedan productos con imágenes locales funcionando`)
