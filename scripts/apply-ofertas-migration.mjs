/**
 * Ofertas: renombra outlet → ofertas y asigna PVP referencia (tag pvp_ref) a sillas.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const OFERTAS = [
  ['sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro', 249],
  ['sillon-de-oficina-clayton-blanco-malla-gris-tejido-azul-claro', 149],
  ['sillon-oficina-clayton-negro-malla-tejido-negro', 179],
  ['sillon-oficina-clent-blanco-malla-tejido-verde', 109],
  ['sillon-oficina-fiss-new-blanco-malla-tejido-verde', 99],
  ['sillon-oficina-fiss-new-negro-malla-tejido-negro', 99],
  ['sillon-oficina-risley-negro-malla-negra-tejido-rojo', 109],
  ['sillon-de-oficina-utrecht-alto-negro-malla-y-tejido-negro', 115],
  ['sillon-oficina-verton-blanco-malla-y-asiento-verde', 119],
  ['sillon-ejecutivo-bernay-malla-negro', 129],
  ['sillon-oficina-mellac-alto-negro-malla-asiento-negro', 119],
  ['sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra', 499],
  ['sofa-larios-2-plazas-tejido-velvet-verde-agua-58', 549],
  ['sofa-larios-3-plazas-tejido-corduroy-gris', 649],
  ['sofa-larios-3-plazas-tapizado-similpiel-blanca', 598],
]

async function setPvpRef(slug, compare, forceOfertas) {
  const { data } = await supabase.from('products').select('tags, category').eq('slug', slug).maybeSingle()
  if (!data) {
    console.log(slug, 'NO ENCONTRADO')
    return
  }
  const tags = (data.tags ?? []).filter((t) => !t.startsWith('pvp_ref:'))
  tags.push(`pvp_ref:${compare}`)
  const payload = { tags, updated_at: new Date().toISOString() }
  if (forceOfertas || data.category === 'outlet') payload.category = 'ofertas'
  const { error } = await supabase.from('products').update(payload).eq('slug', slug)
  console.log(slug, error?.message ?? 'OK')
}

await supabase.from('products').update({ category: 'ofertas' }).eq('category', 'outlet')

await supabase.from('categories').upsert(
  {
    slug: 'ofertas',
    name: 'Ofertas',
    description: 'Las mejores ofertas de nuestra selección con descuentos especiales.',
    image_url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800',
    sort_order: 8,
    is_active: true,
  },
  { onConflict: 'slug' },
)

await supabase.from('categories').update({ is_active: false }).eq('slug', 'outlet')

for (const [slug, compare] of OFERTAS) {
  const isChair = slug.includes('sillon')
  await setPvpRef(slug, compare, isChair)
}

const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('category', 'ofertas')
  .eq('is_active', true)

console.log('\nProductos en ofertas:', count)
