/**
 * Alta de productos Grupo SDM desde URLs (imágenes CDN + PVP IVA/transporte/neto).
 *
 * Uso:
 *   node --env-file=.env.local scripts/add-gruposdm-products.mjs
 *   node --env-file=.env.local scripts/add-gruposdm-products.mjs --url=https://...
 */
import { createClient } from '@supabase/supabase-js'
import { getPricingBreakdown } from './lib/supplier-pricing.mjs'

const URLS = [
  'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-macao-de-pie-metal-dorada.html',
  'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-veypa-de-pie-metal-cromada-turquesa.html',
  'https://gruposdm.com/es/iluminacion/lamparas-de-pie/lampara-atom-de-pie-metal-negra-y-dorada.html',
  'https://gruposdm.com/es/clasicos-del-diseno/butacas-y-sillones-de-diseno/sillon-nordic-r-palo-rosa-similpiel-blanca.html',
  'https://gruposdm.com/es/sofas-butacas-y-sillones/butacas-y-sillones/butaca-con-ottoman-europa-madera-metal-similpiel-beige.html',
]

const CATEGORY_BY_PATH = [
  { match: '/iluminacion/', category: 'iluminacion', subcategory: 'Lámparas de pie' },
  { match: '/clasicos-del-diseno/', category: 'hogar', subcategory: 'Clásicos del diseño' },
  { match: '/sofas-butacas-y-sillones/', category: 'hogar', subcategory: 'Sofás y butacas' },
]

function slugFromUrl(url) {
  return url.match(/\/([^/]+)\.html/)?.[1] ?? ''
}

function formatName(raw) {
  return raw.replace(/\s*,\s*/g, ' · ').replace(/\s+/g, ' ').trim()
}

function formatDescription(raw) {
  if (!raw) return ''
  let text = raw.replace(/^FICHA TÉCNICA:\s*/i, '').trim()
  text = text.replace(/\s*-\s*(?=[A-ZÁÉÍÓÚ0-9])/g, '\n\n')
  text = text.replace(/DIMENSIONES:\s*/i, '\n\nDimensiones (cm): ')
  text = text.replace(/EMBALAJE:\s*/i, '\nEmbalaje: ')
  text = text.replace(/UNIDADES:\s*/i, '\nUnidad: ')
  text = text.replace(/VOLUMEN:\s*/i, ' · volumen: ')
  text = text.replace(/IMPORTANTE\.-\s*/i, '\n\n')
  text = text.replace(/Ancho:\s*(\d+)/i, 'ancho $1')
  text = text.replace(/Fondo:\s*(\d+)/i, 'fondo $1')
  text = text.replace(/Alto:\s*(\d+)/i, 'alto $1')
  text = text.replace(/Altura:\s*(\d+)/i, 'alto $1')
  text = text.replace(/(\d+)\s*cms?/gi, '$1')
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

function categoryForUrl(url) {
  return CATEGORY_BY_PATH.find((c) => url.includes(c.match)) ?? {
    category: 'hogar',
    subcategory: 'Hogar',
  }
}

function inmSku(supplierSku) {
  const suffix = supplierSku?.includes('.') ? supplierSku.split('.').pop() : supplierSku
  return `INM-${suffix}`
}

function tagsFromSlug(slug, subcategory) {
  const words = slug.split('-').filter((w) => w.length > 2 && !/^\d+$/.test(w))
  return [...new Set([...words.slice(0, 8), subcategory.split(' ')[0]?.toLowerCase(), 'pvp_ref'].filter(Boolean))]
}

async function scrape(url) {
  const res = await fetch(url)
  const html = await res.text()
  const slug = slugFromUrl(url)
  const rawTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1]
    ?? html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
    ?? slug
  const supplierSku = html.match(/"sku"\s*:\s*"([^"]+)"/)?.[1]
  const costPrice = Number(
    html.match(/price_tax_exc&quot;:(\d+(?:\.\d+)?)/)?.[1]
      ?? html.match(/"price_tax_exc":(\d+(?:\.\d+)?)/)?.[1],
  )
  const stock = Number(html.match(/&quot;quantity&quot;:(\d+)/)?.[1] ?? 0)
  const images = [...new Set(
    [...html.matchAll(/https:\/\/gruposdm\.com\/\d+-large_default\/[^"']+\.jpg/gi)].map((m) => m[0]),
  )].filter((img) => slug && img.includes(slug))
  const rawDesc = html.match(/id="description"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
  const shortDesc = html.match(/class="product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .trim()
  const features = html.match(/id="product-details"[^>]*>([\s\S]*?)<\/section>/i)?.[1]
  const material = features?.match(/Material[^<]*<[^>]+>([^<]+)/i)?.[1]?.trim()
  const color = features?.match(/Color[^<]*<[^>]+>([^<]+)/i)?.[1]?.trim()

  return {
    slug,
    name: formatName(rawTitle),
    supplierSku,
    costPrice,
    stock,
    images,
    description: formatDescription(rawDesc) || shortDesc || '',
    material: material ?? null,
    color: color ?? null,
    metaDesc: shortDesc?.slice(0, 160) ?? formatName(rawTitle),
  }
}

const urlArg = process.argv.find((a) => a.startsWith('--url='))
const targets = urlArg ? [urlArg.split('=')[1]] : URLS

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

for (const url of targets) {
  console.log(`\n📦 ${slugFromUrl(url)}`)
  const scraped = await scrape(url)
  if (!scraped.supplierSku) {
    console.error('   ❌ SKU no encontrado')
    continue
  }
  if (!scraped.images.length) {
    console.error('   ❌ Sin imágenes CDN')
    continue
  }
  if (!scraped.costPrice) {
    console.error('   ❌ Sin coste proveedor')
    continue
  }

  const { category, subcategory } = categoryForUrl(url)
  const { data: existing } = await supabase
    .from('products')
    .select('id, cost_price, price')
    .eq('supplier_sku', scraped.supplierSku)
    .maybeSingle()

  const cost = existing?.cost_price != null ? Number(existing.cost_price) : scraped.costPrice
  const pricing = getPricingBreakdown(cost)
  const price = existing?.price != null ? Number(existing.price) : pricing.pvp

  const product = {
    slug: scraped.slug,
    name: scraped.name,
    description: scraped.description,
    price,
    cost_price: cost,
    images: scraped.images,
    category,
    subcategory,
    tags: tagsFromSlug(scraped.slug, subcategory),
    sku: inmSku(scraped.supplierSku),
    supplier_sku: scraped.supplierSku,
    supplier: 'gruposdm',
    stock: scraped.stock,
    dimensions: null,
    material: scraped.material,
    color: scraped.color,
    is_active: true,
    is_featured: false,
    meta_title: `${scraped.name} | INMOALIA`.slice(0, 70),
    meta_desc: scraped.metaDesc,
    supplier_product_url: url,
  }

  let error
  if (existing?.id) {
    ;({ error } = await supabase.from('products').update(product).eq('id', existing.id))
  } else {
    ;({ error } = await supabase.from('products').insert(product))
  }

  if (error) {
    console.error('   ❌', error.message)
    continue
  }

  console.log(`   ✅ ${product.name}`)
  console.log(`   ${scraped.supplierSku} | ${category}/${subcategory}`)
  console.log(`   Imágenes: ${scraped.images.length} | Stock: ${product.stock}`)
  console.log(`   Coste ${cost}€ → PVP ${price}€`)
}

console.log('\nHecho.')
