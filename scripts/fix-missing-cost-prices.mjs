import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'
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

/** Costes conocidos (€) — margen histórico ~45–50 € sobre proveedor. */
const COST_BY_SLUG = {
  'sillon-oficina-fiss-new-negro-malla-tejido-negro': 30.6,
  'sillon-oficina-fiss-new-blanco-malla-tejido-verde': 33.15,
  'sillon-oficina-risley-negro-malla-negra-tejido-rojo': 37.5,
  'sillon-oficina-clent-blanco-malla-tejido-verde': 37.2,
  'sillon-oficina-mellac-alto-negro-malla-asiento-negro': 45,
  'sillon-oficina-verton-blanco-malla-y-asiento-verde': 44.1,
  'sillon-ejecutivo-bernay-malla-negro': 54,
  'sillon-ergonomico-graz-blanco-negro': 57.75,
  'sillon-gaming-portimao-amarillo-negro': 55.3,
  'sillon-oficina-clayton-negro-malla-tejido-negro': 99,
  'sillon-de-oficina-clayton-blanco-malla-gris-tejido-azul-claro': 72.5,
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': 159,
  'sillon-de-oficina-utrecht-alto-negro-malla-y-tejido-negro': 42.7,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data: missing } = await supabase
  .from('products')
  .select('id, slug, name, price, supplier_product_url, cost_price')
  .is('cost_price', null)
  .eq('is_active', true)

console.log(`Productos sin coste: ${missing?.length ?? 0}`)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

for (const row of missing ?? []) {
  let cost = COST_BY_SLUG[row.slug]

  if (cost == null && row.supplier_product_url?.includes('gruposdm.com')) {
    try {
      await page.goto(row.supplier_product_url, { waitUntil: 'load', timeout: 25000 })
      const scraped = await page.evaluate(() => {
        const priceEl = document.querySelector('.current-price, .product-price')
        const text = priceEl?.textContent ?? document.body.innerText
        const m = text.match(/([\d]+[,.][\d]{2})\s*€/)
        return m ? parseFloat(m[1].replace(',', '.')) : null
      })
      if (scraped != null && scraped > 0) cost = scraped
    } catch (e) {
      console.warn(`Scrape falló ${row.slug}:`, e.message)
    }
  }

  if (cost == null && row.price) {
    cost = Math.round((Number(row.price) - 45) * 100) / 100
    if (cost <= 0) continue
    console.log(`  Estimado (PVP−45€): ${row.slug} → ${cost}€`)
  }

  if (cost == null) {
    console.log(`  ⚠️ Sin coste: ${row.slug}`)
    continue
  }

  const { error } = await supabase.from('products').update({ cost_price: cost }).eq('id', row.id)
  if (error) console.error(`❌ ${row.slug}:`, error.message)
  else console.log(`✅ ${row.slug}: ${cost}€ (PVP ${row.price}€)`)
}

await browser.close()
