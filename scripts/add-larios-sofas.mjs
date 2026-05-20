import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const MARGIN = 50
const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')

const PRODUCTS = [
  {
    url: 'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofa-de-2-plazas/sofa-larios-2-plazas-tejido-velvet-verde-agua-58.html',
    supplier_sku: '252.SLAR2VE58',
    cost_price: 415,
    stock: 5,
  },
  {
    url: 'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofas-de-3-plazas/sofa-larios-3-plazas-tejido-corduroy-gris.html',
    supplier_sku: '252.SLAR3COGR',
    cost_price: 505,
    stock: 5,
  },
  {
    url: 'https://gruposdm.com/es/sofas-butacas-y-sillones/sofas-y-sillones/sofas-de-3-plazas/sofa-larios-3-plazas-tapizado-similpiel-blanca.html',
    supplier_sku: '252.SLAR3SBL',
    cost_price: 498,
    stock: 10,
  },
]

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function scrapeProduct(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 })
  return page.evaluate(() => {
    const name = document.querySelector('h1')?.textContent?.trim()
    const reference = document.body.innerText.match(/Referencia\s+([\d.A-Z]+)/)?.[1]
    const shortDesc = document.querySelector('.product-description')?.textContent?.trim()
    const details = document.querySelector('#description')?.textContent?.trim()
    const features = document.querySelector('.product-features')?.textContent?.trim()
    const stockText = document.querySelector('.product-quantities')?.textContent
    const stock = stockText?.match(/\d+/)?.[0] ? parseInt(stockText.match(/\d+/)[0], 10) : null
    const images = []
    document.querySelectorAll('.js-qv-product-images img').forEach((img) => {
      let src = img.getAttribute('data-image-large-src') || img.src
      if (src) src = src.replace('-thickbox_default/', '-large_default/').replace('-home_default/', '-large_default/')
      if (src?.includes('gruposdm.com') && !images.includes(src)) images.push(src)
    })
    const dimMatch = details?.match(/Ancho:\s*([\d,.]+)\s*cms.*?Fondo:\s*([\d,.]+)\s*cms.*?Alt[ou]ra?:\s*([\d,.~]+)\s*cms/is)
    const color = features?.match(/Color\s+([^\n]+)/i)?.[1]?.trim()
    const material = features?.match(/Material\s+([^\n]+)/i)?.[1]?.trim()
    return { name, reference, shortDesc, details, images, stock, color, material, dimMatch, url: location.href }
  })
}

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const toInsert = []

for (const cfg of PRODUCTS) {
  console.log(`\n📦 ${cfg.supplier_sku}`)
  const scraped = await scrapeProduct(page, cfg.url)
  const slug = slugify(scraped.name)
  const localImages = []

  for (let i = 0; i < scraped.images.length; i++) {
    const filename = `${slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    const response = await page.goto(scraped.images[i], { waitUntil: 'load', timeout: 20000 })
    const buffer = await response.body()
    if (buffer.length < 1000) {
      console.log(`   ⚠️  Imagen ${i + 1} demasiado pequeña, omitida`)
      continue
    }
    fs.writeFileSync(filepath, buffer)
    localImages.push(`/imagenes/productos/${filename}`)
    console.log(`   ✅ ${filename} (${Math.round(buffer.length / 1024)} KB)`)
  }

  const width = scraped.dimMatch ? parseFloat(scraped.dimMatch[1].replace(',', '.')) : null
  const depth = scraped.dimMatch ? parseFloat(scraped.dimMatch[2].replace(',', '.')) : null
  const heightRaw = scraped.dimMatch?.[3]?.replace(',', '.').replace('~', '')
  const height = heightRaw ? parseFloat(heightRaw.split(/[-~]/)[0]) : null

  let description = scraped.details || scraped.shortDesc || ''
  description = description
    .replace(/^FICHA TÉCNICA:\s*/i, '')
    .replace(/\s*Referencia proveedor[^.]*\.?/gi, '')
    .trim()

  const price = cfg.cost_price + MARGIN
  const sku = `INM-${cfg.supplier_sku.replace('.', '')}`

  toInsert.push({
    slug,
    name: scraped.name.replace(/\s+/g, ' ').replace(/,/g, ' ·'),
    description,
    price,
    cost_price: cfg.cost_price,
    images: localImages,
    category: 'hogar',
    subcategory: 'Sofás y butacas',
    tags: ['LARIOS', 'sofá', 'salón', 'muebles', 'diseño', scraped.color?.toLowerCase()].filter(Boolean),
    sku,
    supplier_sku: cfg.supplier_sku,
    supplier: 'gruposdm',
    stock: scraped.stock ?? cfg.stock,
    dimensions: width && depth && height ? { width, height, depth } : null,
    material: scraped.material || 'Madera, espuma alta densidad, tapizado',
    color: scraped.color,
    is_active: true,
    is_featured: false,
    meta_title: `${scraped.name.split(',')[0]} | INMOALIA`,
    meta_desc: `${scraped.shortDesc?.slice(0, 140) ?? scraped.name}. Certificación UNE.`,
    supplier_product_url: cfg.url,
  })

  console.log(`   💰 ${cfg.cost_price}€ → ${price}€ (+${MARGIN}€)`)
  console.log(`   📦 Stock: ${scraped.stock ?? cfg.stock}`)
}

await browser.close()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

for (const product of toInsert) {
  const { data: existing } = await supabase.from('products').select('id').eq('slug', product.slug).maybeSingle()
  const { error } = existing
    ? await supabase.from('products').update(product).eq('id', existing.id)
    : await supabase.from('products').insert(product)

  if (error) {
    console.error(`❌ ${product.slug}:`, error.message)
  } else {
    console.log(`\n✅ ${existing ? 'Actualizado' : 'Insertado'}: ${product.slug}`)
  }
}

console.log('\n--- RESUMEN ---')
for (const p of toInsert) {
  console.log(`${p.name} | ${p.price}€ | ${p.images.length} imgs | ${p.slug}`)
}
