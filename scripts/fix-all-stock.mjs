import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('📊 ACTUALIZANDO STOCK DE TODOS LOS PRODUCTOS\n')

const { data: products } = await supabase
  .from('products')
  .select('id, name, stock, supplier')
  .ilike('supplier', '%grupo%')

for (const product of products) {
  let newStock
  
  if (product.stock === 999) {
    // Stock aleatorio realista entre 5 y 50
    newStock = Math.floor(Math.random() * 46) + 5
  } else {
    // Mantener el stock actual si no es 999
    continue
  }
  
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', product.id)
  
  if (error) {
    console.log(`❌ ${product.name}: ${error.message}`)
  } else {
    console.log(`✅ ${product.name}: ${newStock} unidades`)
  }
}

console.log('\n✅ Stock actualizado para todos los productos')
