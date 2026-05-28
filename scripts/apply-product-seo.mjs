/**
 * Rellena y optimiza meta_title / meta_desc de productos activos.
 * Uso: node --env-file=.env.local scripts/apply-product-seo.mjs
 *      node --env-file=.env.local scripts/apply-product-seo.mjs --dry-run
 */

import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const META_DESC_MAX = 158
const META_TITLE_MAX = 58
const META_DESC_MIN_OK = 120

const CATEGORY_META = {
  jardin: 'Jardín y Exterior',
  mesas: 'Mesas',
  sillas: 'Sillas y Butacas',
  iluminacion: 'Iluminación',
  textil: 'Textil Hogar',
  hogar: 'Hogar',
  muebles: 'Muebles',
  ofertas: 'Ofertas',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function truncateAtWord(text, max) {
  const t = text.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace > max * 0.6) return `${cut.slice(0, lastSpace).trim()}…`
  return `${cut.trim()}…`
}

function formatPriceEur(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)
}

function categoryLabel(product) {
  if (product.subcategory?.trim()) return product.subcategory.trim()
  return CATEGORY_META[product.category] ?? product.category
}

function firstSentence(text) {
  const clean = stripHtml(text ?? '')
  const match = clean.match(/^[^.!?]+[.!?]?/)
  return (match?.[0] ?? clean).trim()
}

function buildProductMetaTitle(product) {
  if (product.meta_title?.trim()) {
    const cleaned = product.meta_title.trim().replace(/\s*\|\s*INMOALIA\s*$/i, '')
    if (cleaned.length >= Math.min(product.name.length, 40)) {
      return truncateAtWord(cleaned, META_TITLE_MAX)
    }
  }

  const cat = categoryLabel(product)
  const withCat = `${product.name} · ${cat}`
  if (withCat.length <= META_TITLE_MAX) return withCat
  if (product.name.length <= META_TITLE_MAX) return product.name
  return truncateAtWord(product.name, META_TITLE_MAX)
}

function buildProductMetaDescription(product) {
  if (product.meta_desc?.trim() && product.meta_desc.trim().length >= META_DESC_MIN_OK) {
    return truncateAtWord(product.meta_desc.trim(), META_DESC_MAX)
  }

  const price = formatPriceEur(product.price)
  const cat = categoryLabel(product).toLowerCase()
  const snippet = firstSentence(product.description ?? '')
  const material = product.material?.trim()

  const variants = [
    material
      ? `${product.name}: ${material}. Compra online en INMOALIA desde ${price}. Envío 2-5 días laborables en España.`
      : null,
    snippet
      ? `${truncateAtWord(snippet, 90)} Compra en INMOALIA desde ${price}. Envío 2-5 días.`
      : null,
    `Compra ${product.name} en INMOALIA. ${cat} de calidad desde ${price}. Envío rápido a toda España.`,
    `${product.name} — ${cat} en INMOALIA. Precio ${price}. Envío 2-5 días laborables.`,
  ].filter(Boolean)

  for (const candidate of variants) {
    if (candidate.length <= META_DESC_MAX) return candidate
  }

  return truncateAtWord(variants[variants.length - 1], META_DESC_MAX)
}

function needsUpdate(product) {
  const title = buildProductMetaTitle(product)
  const desc = buildProductMetaDescription(product)
  const currentTitle = product.meta_title?.trim() ?? ''
  const currentDesc = product.meta_desc?.trim() ?? ''

  const titleMissing = !currentTitle
  const descMissing = !currentDesc || currentDesc.length < META_DESC_MIN_OK
  const titleHasDuplicateBrand = /\|\s*INMOALIA/i.test(currentTitle)
  const titleChanged = currentTitle !== title
  const descChanged = currentDesc !== desc

  return {
    title,
    desc,
    shouldUpdate:
      titleMissing ||
      descMissing ||
      titleHasDuplicateBrand ||
      titleChanged ||
      descChanged,
    reason: [
      titleMissing && 'sin meta_title',
      descMissing && 'meta_desc corta o vacía',
      titleHasDuplicateBrand && 'título duplica INMOALIA',
      !titleMissing && !descMissing && titleChanged && 'título optimizado',
      !titleMissing && !descMissing && descChanged && 'descripción optimizada',
    ]
      .filter(Boolean)
      .join(', '),
  }
}

async function main() {
  console.log(`🔍 SEO productos INMOALIA${DRY_RUN ? ' (dry-run)' : ''}\n`)

  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, name, description, price, category, subcategory, material, meta_title, meta_desc')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('❌ Error Supabase:', error.message)
    process.exit(1)
  }

  let updated = 0
  let skipped = 0

  for (const product of products) {
    const { title, desc, shouldUpdate, reason } = needsUpdate(product)

    if (!shouldUpdate) {
      skipped++
      continue
    }

    console.log(`📦 ${product.slug}`)
    console.log(`   → ${reason}`)
    console.log(`   title (${title.length}): ${title}`)
    console.log(`   desc  (${desc.length}): ${desc}`)

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ meta_title: title, meta_desc: desc })
        .eq('id', product.id)

      if (updateError) {
        console.error(`   ❌ ${updateError.message}`)
        continue
      }
    }

    console.log(`   ✅ ${DRY_RUN ? 'simulado' : 'actualizado'}\n`)
    updated++
  }

  console.log('━'.repeat(60))
  console.log(`📊 Total activos: ${products.length}`)
  console.log(`   ✅ ${DRY_RUN ? 'A actualizar' : 'Actualizados'}: ${updated}`)
  console.log(`   ⏭️  Sin cambios: ${skipped}`)
  console.log('━'.repeat(60))
}

main().catch((err) => {
  console.error('💥 ERROR:', err)
  process.exit(1)
})
