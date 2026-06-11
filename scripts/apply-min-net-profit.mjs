/**
 * Ajusta el PVP para que el beneficio neto (base − coste − transporte) sea ≥ 60 €.
 * Uso:
 *   node --env-file=.env.local scripts/apply-min-net-profit.mjs --dry-run
 *   node --env-file=.env.local scripts/apply-min-net-profit.mjs
 *   node --env-file=.env.local scripts/apply-min-net-profit.mjs --min=60
 */

import { createClient } from '@supabase/supabase-js'

const IVA_RATE = 0.21
const DRY_RUN = process.argv.includes('--dry-run')
const minArg = process.argv.find((a) => a.startsWith('--min='))
const MIN_NET = minArg ? parseFloat(minArg.split('=')[1]) : 60

const SHIPPING_TIERS = [
  { min: 1, max: 60, cost: 22 },
  { min: 61, max: 120, cost: 28 },
  { min: 121, max: 190, cost: 33 },
  { min: 191, max: 300, cost: 39 },
  { min: 301, max: 400, cost: 45 },
  { min: 401, max: 500, cost: 49 },
  { min: 501, max: 599, cost: 59 },
]

function roundEuros(n) {
  return Math.round(n * 100) / 100
}

function getShippingCost(coste) {
  const amount = Math.max(0, coste)
  if (amount < 1) return SHIPPING_TIERS[0].cost
  const tier = SHIPPING_TIERS.find((t) => amount >= t.min && amount <= t.max)
  return tier?.cost ?? SHIPPING_TIERS[SHIPPING_TIERS.length - 1].cost
}

function minPvp(coste, minNet) {
  const transporte = getShippingCost(coste)
  const base = roundEuros(coste + transporte + minNet)
  return roundEuros(base * (1 + IVA_RATE))
}

function netoFromPvp(pvp, coste) {
  const base = roundEuros(pvp / (1 + IVA_RATE))
  const transporte = getShippingCost(coste)
  return roundEuros(base - coste - transporte)
}

if (!Number.isFinite(MIN_NET) || MIN_NET < 0) {
  console.error('Importe mínimo inválido. Usa --min=60')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, name, price, cost_price, tags')
  .order('name')

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(DRY_RUN ? '=== DRY RUN ===' : '=== APLICANDO ===')
console.log(`Beneficio neto mínimo: ${MIN_NET}€ · ${products?.length ?? 0} productos\n`)

let updated = 0
let skipped = 0
let noCost = 0

for (const p of products ?? []) {
  const coste = p.cost_price != null ? Number(p.cost_price) : null
  if (coste == null || coste <= 0) {
    noCost++
    console.log(`⚠️  ${p.slug} — sin cost_price, omitido`)
    continue
  }

  const oldPrice = Number(p.price)
  const minPrice = minPvp(coste, MIN_NET)
  const oldNeto = netoFromPvp(oldPrice, coste)

  if (oldPrice >= minPrice) {
    skipped++
    continue
  }

  const newNeto = netoFromPvp(minPrice, coste)
  console.log(
    `${p.slug.slice(0, 40).padEnd(40)} ${oldPrice}€ → ${minPrice}€` +
      ` (neto ${oldNeto}€ → ${newNeto}€ · coste ${coste}€)`,
  )

  if (!DRY_RUN) {
    const tags = p.tags ?? []
    const refTag = tags.find((t) => t.startsWith('pvp_ref:'))
    const payload = { price: minPrice }

    if (refTag) {
      const oldRef = parseFloat(refTag.replace('pvp_ref:', ''))
      if (Number.isFinite(oldRef) && oldRef < minPrice) {
        payload.tags = tags.map((t) =>
          t.startsWith('pvp_ref:') ? `pvp_ref:${minPrice}` : t,
        )
      }
    }

    const { error: upErr } = await supabase.from('products').update(payload).eq('id', p.id)
    if (upErr) {
      console.error(`  ❌ ${p.slug}:`, upErr.message)
      continue
    }
    updated++
  }
}

const changed = DRY_RUN ? (products?.length ?? 0) - skipped - noCost : updated
console.log(
  `\n${DRY_RUN ? 'Simulación' : 'Actualizados'}: ${changed} · Ya cumplían: ${skipped} · Sin coste: ${noCost}`,
)
