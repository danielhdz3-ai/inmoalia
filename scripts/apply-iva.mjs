/**
 * Aplica IVA 21% a todos los precios de venta (price y compare_at_price).
 * Uso:
 *   node --env-file=.env.local scripts/apply-iva.mjs --dry-run
 *   node --env-file=.env.local scripts/apply-iva.mjs
 */

import { createClient } from '@supabase/supabase-js'

const IVA_RATE = 0.21
const DRY_RUN = process.argv.includes('--dry-run')

function applyIva(price) {
  return Math.round(price * (1 + IVA_RATE) * 100) / 100
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, name, price, tags')
  .order('name')

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(DRY_RUN ? '=== DRY RUN (IVA 21%) ===' : '=== APLICANDO IVA 21% ===')
console.log(`${products?.length ?? 0} productos\n`)

let updated = 0
for (const p of products ?? []) {
  const oldPrice = Number(p.price)
  const newPrice = applyIva(oldPrice)
  const tags = p.tags ?? []
  const refTag = tags.find((t) => t.startsWith('pvp_ref:'))
  const oldRef = refTag ? parseFloat(refTag.replace('pvp_ref:', '')) : null
  const newRef = oldRef != null ? applyIva(oldRef) : null
  const newTags =
    newRef != null
      ? tags.map((t) => (t.startsWith('pvp_ref:') ? `pvp_ref:${newRef}` : t))
      : tags

  console.log(
    `${p.slug.slice(0, 42).padEnd(42)} ${oldPrice}€ → ${newPrice}€` +
      (oldRef != null ? ` (ref ${oldRef}€ → ${newRef}€)` : ''),
  )

  if (!DRY_RUN) {
    const payload = { price: newPrice }
    if (newRef != null) payload.tags = newTags

    const { error: upErr } = await supabase.from('products').update(payload).eq('id', p.id)
    if (upErr) {
      console.error(`  ❌ ${p.slug}:`, upErr.message)
      continue
    }
    updated++
  }
}

console.log(
  `\n${DRY_RUN ? 'Simulación' : 'Actualizados'}: ${DRY_RUN ? products?.length : updated} productos`,
)
