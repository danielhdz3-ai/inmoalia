// node scripts/add-product.mjs <URL-PRODUCTO-GRUPOSDM>
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const url = process.argv[2]
if (!url) {
  console.log('❌ Uso: node scripts/add-product.mjs <URL>')
  process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

console.log('🔍 Extrayendo producto...')
await page.goto(url, { waitUntil: 'load', timeout: 15000 })

const data = await page.evaluate(() => {
  const name = document.querySelector('h1')?.textContent?.trim()
  const price = document.querySelector('.current-price-value')?.getAttribute('content')
  const reference = document.querySelector('[itemprop="sku"]')?.textContent?.trim()
  const description = document.querySelector('.product-description')?.textContent?.trim()
  const stock = document.querySelector('.product-quantities')?.textContent?.match(/\d+/)?.[0] || '50'
  
  const images = []
  document.querySelectorAll('.js-qv-product-images img').forEach(img => {
    const src = img.getAttribute('data-image-large-src') || img.src
    if (src && src.includes('gruposdm.com')) images.push(src)
  })
  
  return { name, price: parseFloat(price), reference, description, stock: parseInt(stock), images }
})

const slug = data.name.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const proxyImages = data.images.map(img => `/api/image-proxy?url=${encodeURIComponent(img)}`)

const { error } = await supabase.from('products').insert({
  name: data.name,
  slug,
  price: data.price * 2.5,
  cost_price: data.price,
  supplier: 'Grupo SDM',
  supplier_sku: data.reference,
  stock: data.stock,
  description: data.description?.substring(0, 500),
  images: proxyImages,
  is_active: true
})

await browser.close()

if (error) {
  console.log('❌', error.message)
} else {
  console.log(`✅ ${data.name}`)
  console.log(`   ${data.price}€ → ${(data.price * 2.5).toFixed(2)}€`)
  console.log(`   ${data.images.length} imágenes | Stock: ${data.stock}`)
}
