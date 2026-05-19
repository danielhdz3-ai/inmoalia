/**
 * Verificar URLs de proxy convertidas
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: product } = await supabase
  .from('products')
  .select('name, images')
  .eq('slug', 'sillon-ejecutivo-bernay-malla-negro')
  .single()

console.log('Producto:', product.name)
console.log('Imágenes:')
product.images.forEach((img, i) => {
  console.log(`  ${i + 1}. ${img}`)
})
