/**
 * Verificar estado de GRAZ y PORTIMAO
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const slugs = [
  'sillon-ergonomico-graz-blanco-negro',
  'sillon-gaming-portimao-amarillo-negro'
]

for (const slug of slugs) {
  const { data: product } = await supabase
    .from('products')
    .select('name, images')
    .eq('slug', slug)
    .single()

  console.log(`\n${product.name}:`)
  product.images.forEach((img, i) => {
    console.log(`  ${i + 1}. ${img}`)
  })
}
