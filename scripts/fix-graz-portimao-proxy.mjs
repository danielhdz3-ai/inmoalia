import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const updates = {
  'sillon-ergonomico-graz-blanco-negro': [
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79417-large_default%2Fsillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79418-large_default%2Fsillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79419-large_default%2Fsillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'
  ],
  'sillon-gaming-portimao-amarillo-negro': [
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79401-large_default%2Fsillon-gaming-portimao-amarillo-y-negro.jpg',
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79402-large_default%2Fsillon-gaming-portimao-amarillo-y-negro.jpg',
    '/api/image-proxy?url=https%3A%2F%2Fgruposdm.com%2F79403-large_default%2Fsillon-gaming-portimao-amarillo-y-negro.jpg'
  ]
}

for (const [slug, images] of Object.entries(updates)) {
  const { error } = await supabase
    .from('products')
    .update({ images })
    .eq('slug', slug)
  
  console.log(error ? `❌ ${slug}` : `✅ ${slug}`)
}

console.log('\n✅ Listo para deploy')
