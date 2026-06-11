/**
 * Alta/actualización de sillones Grupo SDM con imágenes CDN (gruposdm.com).
 * PVP: coste + transporte + 60 € neto + IVA 21 %.
 *
 * Uso: node --env-file=.env.local scripts/add-gruposdm-chairs-batch.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { getPricingBreakdown } from './lib/supplier-pricing.mjs'

const PRODUCTS = [
  {
    url: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.html',
    supplier_sku: '794.SUTRECNNE',
    sku: 'INM-SUTRECNNE',
    name: 'Sillón de oficina UTRECH, alto · negro · malla y tejido negro',
    color: 'Negro',
    material: 'Polipropileno reforzado con fibra de vidrio, malla, tejido acrílico',
    dimensions: { width: 64, height: 123, depth: 61 },
    tags: ['oficina', 'sillón', 'Utrech', 'malla', 'negro', 'basculante', 'ergonómico', 'cabezal', 'pvp_ref'],
    meta_title: 'Sillón de oficina UTRECH alto negro malla y tejido | INMOALIA',
    meta_desc: 'Sillón UTRECH alto con cabezal, basculante y malla negra. 64×61×112–123 cm. IVA incluido. Certificación UNE.',
  },
  {
    url: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.html',
    supplier_sku: '762.SMAINASGR',
    sku: 'INM-SMAINASGR',
    name: 'Sillón de oficina MAINZ, alto · giratorio · similpiel gris',
    color: 'Gris',
    material: 'Similpiel, acero cromado',
    dimensions: { width: 65, height: 120, depth: 58 },
    tags: ['oficina', 'sillón', 'Mainz', 'similpiel', 'gris', 'dirección', 'giratorio', 'pvp_ref'],
    meta_title: 'Sillón de oficina MAINZ alto similpiel gris | INMOALIA',
    meta_desc: 'Sillón MAINZ alto giratorio en similpiel gris. Base cromada, reclinación y 65×58×110–120 cm. IVA incluido.',
  },
  {
    url: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-blanco-roto.html',
    supplier_sku: '762.SMAINASBR',
    sku: 'INM-SMAINASBR',
    name: 'Sillón de oficina MAINZ, alto · giratorio · similpiel blanco roto',
    color: 'Blanco roto',
    material: 'Similpiel, acero cromado',
    dimensions: { width: 65, height: 120, depth: 58 },
    tags: ['oficina', 'sillón', 'Mainz', 'similpiel', 'blanco', 'dirección', 'giratorio', 'pvp_ref'],
    meta_title: 'Sillón de oficina MAINZ alto similpiel blanco roto | INMOALIA',
    meta_desc: 'Sillón MAINZ alto giratorio en similpiel blanco roto. Base cromada y 65×58×110–120 cm. IVA incluido.',
  },
  {
    url: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-negra.html',
    supplier_sku: '762.SMAINASNE',
    sku: 'INM-SMAINASNE',
    name: 'Sillón de oficina MAINZ, alto · giratorio · similpiel negra',
    color: 'Negro',
    material: 'Similpiel, acero cromado',
    dimensions: { width: 65, height: 120, depth: 58 },
    tags: ['oficina', 'sillón', 'Mainz', 'similpiel', 'negro', 'dirección', 'giratorio', 'pvp_ref'],
    meta_title: 'Sillón de oficina MAINZ alto similpiel negra | INMOALIA',
    meta_desc: 'Sillón MAINZ alto giratorio en similpiel negra. Base cromada y 65×58×110–120 cm. IVA incluido.',
  },
]

function slugFromUrl(url) {
  return url.match(/\/([^/]+)\.html/)?.[1] ?? ''
}

function formatDescription(raw) {
  if (!raw) return ''
  let text = raw.replace(/^FICHA TÉCNICA:\s*/i, '').trim()
  text = text.replace(/\s*-\s*(?=[A-ZÁÉÍÓÚ])/g, '\n\n')
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
  text = text.replace(/(\d+)~(\d+)\s*cms?/gi, '$1–$2')
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

async function scrape(url) {
  const res = await fetch(url)
  const html = await res.text()
  const slug = slugFromUrl(url)
  const title = html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.trim()
  const sku = html.match(/"sku"\s*:\s*"([^"]+)"/)?.[1]
  const costPrice = Number(html.match(/price_tax_exc&quot;:(\d+(?:\.\d+)?)/)?.[1]
    ?? html.match(/"price_tax_exc":(\d+(?:\.\d+)?)/)?.[1])
  const stock = Number(html.match(/&quot;quantity&quot;:(\d+)/)?.[1] ?? 0)
  const images = [...new Set([...html.matchAll(/https:\/\/gruposdm\.com\/\d+-large_default\/[^"']+\.jpg/gi)]
    .map((m) => m[0]))].filter((img) => slug && img.includes(slug))
  const rawDesc = html.match(/id="description"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
  return { title, sku, costPrice, stock, images, description: formatDescription(rawDesc) }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

for (const cfg of PRODUCTS) {
  console.log(`\n📦 ${cfg.supplier_sku}`)
  const scraped = await scrape(cfg.url)
  if (!scraped.images.length) {
    console.error('   ❌ Sin imágenes CDN')
    continue
  }

  const slug = slugFromUrl(cfg.url)
  const { data: existing } = await supabase
    .from('products')
    .select('id, cost_price, price')
    .eq('supplier_sku', cfg.supplier_sku)
    .maybeSingle()

  const cost = existing?.cost_price != null ? Number(existing.cost_price) : scraped.costPrice
  const pricing = getPricingBreakdown(cost)
  const price = existing?.price != null ? Number(existing.price) : pricing.pvp

  const product = {
    slug,
    name: cfg.name,
    description: scraped.description || cfg.meta_desc,
    price,
    cost_price: cost,
    images: scraped.images,
    category: 'sillas',
    subcategory: 'Sillas de oficina',
    tags: cfg.tags,
    sku: cfg.sku,
    supplier_sku: cfg.supplier_sku,
    supplier: 'gruposdm',
    stock: scraped.stock || 0,
    dimensions: cfg.dimensions,
    material: cfg.material,
    color: cfg.color,
    is_active: true,
    is_featured: false,
    meta_title: cfg.meta_title,
    meta_desc: cfg.meta_desc,
    supplier_product_url: cfg.url,
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
  console.log(`   Imágenes CDN: ${scraped.images.length} | Stock: ${product.stock}`)
  console.log(`   Coste ${cost}€ → PVP ${price}€`)
}

console.log('\nHecho.')
