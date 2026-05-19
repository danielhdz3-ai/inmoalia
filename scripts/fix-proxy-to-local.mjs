/**
 * Convertir URLs de proxy a rutas locales descargadas
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔄 CONVIRTIENDO PROXY A LOCAL\n')

// Los 3 productos con proxy que ya tienen imágenes descargadas
const conversions = {
  'sillon-ejecutivo-bernay-malla-negro': [
    '/imagenes/productos/sillon-ejecutivo-bernay-malla-negro-1.jpg',
    '/imagenes/productos/sillon-ejecutivo-bernay-malla-negro-2.jpg',
    '/imagenes/productos/sillon-ejecutivo-bernay-malla-negro-3.jpg'
  ],
  'sillon-ergonomico-graz-blanco-negro': [
    '/imagenes/productos/sillon-ergonomico-graz-blanco-negro-1.jpg',
    '/imagenes/productos/sillon-ergonomico-graz-blanco-negro-2.jpg',
    '/imagenes/productos/sillon-ergonomico-graz-blanco-negro-3.jpg'
  ],
  'sillon-gaming-portimao-amarillo-negro': [
    '/imagenes/productos/sillon-gaming-portimao-amarillo-negro-1.jpg',
    '/imagenes/productos/sillon-gaming-portimao-amarillo-negro-2.jpg',
    '/imagenes/productos/sillon-gaming-portimao-amarillo-negro-3.jpg'
  ]
}

for (const [slug, localImages] of Object.entries(conversions)) {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, name, images')
    .eq('slug', slug)
    .single()

  if (fetchError) {
    console.log(`❌ ${slug}: ${fetchError.message}`)
    continue
  }

  console.log(`📦 ${product.name}`)
  console.log(`   Antes: ${product.images[0].substring(0, 50)}...`)
  
  const { error: updateError } = await supabase
    .from('products')
    .update({ images: localImages })
    .eq('id', product.id)

  if (updateError) {
    console.log(`   ❌ Error: ${updateError.message}`)
  } else {
    console.log(`   Después: ${localImages[0]}`)
    console.log(`   ✅ Convertido a local\n`)
  }
}

console.log('🎉 Conversión completada')
