/**
 * Sincroniza catálogo EXISTENTE desde Grupo SDM (solo actualiza, no crea productos).
 * Requiere sesión iniciada en el navegador para ver precios mayoristas.
 *
 * Uso:
 *   node --env-file=.env.local scripts/sync-gruposdm-update.mjs --dry-run
 *   node --env-file=.env.local scripts/sync-gruposdm-update.mjs
 *   node --env-file=.env.local scripts/sync-gruposdm-update.mjs --limit=5
 *
 * Flujo:
 *   1. Se abre Chromium
 *   2. Inicias sesión en gruposdm.com manualmente
 *   3. Pulsas ENTER en la terminal
 *   4. El script recorre cada producto con URL de proveedor y actualiza coste, stock y PVP mínimo
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { minPvpForNetProfit, roundEuros } from './lib/supplier-pricing.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const DRY_RUN = process.argv.includes('--dry-run')
const READY = process.argv.includes('--ready')
const waitSecArg = process.argv.find((a) => a.startsWith('--wait-seconds='))
const WAIT_SECONDS = waitSecArg ? parseInt(waitSecArg.split('=')[1], 10) : null
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : null
const DELAY_MS = 800

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close()
      resolve()
    })
  })
}

/** Extrae coste mayorista, stock y disponibilidad de la ficha Grupo SDM. */
async function scrapeGrupoSDMProduct(page) {
  return page.evaluate(() => {
    const parseEuro = (raw) => {
      if (raw == null || raw === '') return null
      const n = parseFloat(String(raw).replace(',', '.').replace(/[^\d.]/g, ''))
      return Number.isFinite(n) && n > 0 ? n : null
    }

    let cost =
      parseEuro(document.querySelector('.current-price-value')?.getAttribute('content')) ??
      parseEuro(document.querySelector('[itemprop="price"]')?.getAttribute('content'))

    if (cost == null) {
      const priceEl = document.querySelector('.current-price, .product-price, .price')
      const m = (priceEl?.textContent ?? document.body.innerText).match(/([\d]+[,.][\d]{1,2})\s*€/)
      if (m) cost = parseEuro(m[1])
    }

    const bodyText = document.body.innerText
    const bodyLower = bodyText.toLowerCase()

    const unavailable =
      /\bconsultar\b/.test(bodyLower) ||
      /\bagotado\b/.test(bodyLower) ||
      /\bsin stock\b/.test(bodyLower) ||
      /\bno disponible\b/.test(bodyLower)

    let stock = null
    const stockSelectors = ['.product-quantities', '.product-availability', '[data-stock]']
    for (const sel of stockSelectors) {
      const el = document.querySelector(sel)
      if (el) {
        const m = (el.textContent ?? '').match(/(\d+)/)
        if (m) {
          stock = parseInt(m[1], 10)
          break
        }
      }
    }

    if (stock == null) {
      const patterns = [
        /(\d+)\s*art[ií]culos?/i,
        /en stock[:\s]*(\d+)/i,
        /disponibles?[:\s]*(\d+)/i,
        /(\d+)\s*unidades?/i,
      ]
      for (const pat of patterns) {
        const m = bodyText.match(pat)
        if (m) {
          stock = parseInt(m[1], 10)
          break
        }
      }
    }

    if (stock == null && !unavailable) {
      if (/en stock|disponible/i.test(bodyText)) stock = 50
    }

    if (stock == null && unavailable) stock = 0

    const sku =
      document.querySelector('[itemprop="sku"]')?.textContent?.trim() ??
      document.querySelector('.product-reference')?.textContent?.replace(/referencia\s*:?\s*/i, '').trim() ??
      null

    return { cost, stock, unavailable, sku }
  })
}

function isProductPageUrl(url) {
  if (!url?.includes('gruposdm.com')) return false
  if (url.includes('/content/') || url.includes('/buscar') || url.includes('controller=')) return false
  if (!url.includes('.html')) return false
  return true
}

async function resolveProductUrl(page, product) {
  const direct = product.supplier_product_url?.trim()
  if (direct && isProductPageUrl(direct)) return direct

  const sku = product.supplier_sku?.trim()
  if (!sku) return null

  const searchUrl = `https://gruposdm.com/es/buscar?controller=search&s=${encodeURIComponent(sku)}`
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(DELAY_MS)

  const found = await page.evaluate((expectedSku) => {
    const norm = (s) => s.toUpperCase().replace(/[\s.-]/g, '')
    const target = norm(expectedSku)
    const scope = document.querySelector('#js-product-list, .products, #products') ?? document.body
    const links = scope.querySelectorAll(
      'article a[href*=".html"], .product-miniature a[href*=".html"], .js-product-miniature a[href*=".html"]',
    )

    for (const a of links) {
      const href = a.href?.split('?')[0] ?? ''
      if (!href.includes('gruposdm.com') || href.includes('/content/')) continue
      const card = a.closest('article, .product-miniature, .js-product-miniature')
      const refText = card?.querySelector('.product-reference, .reference, [itemprop="sku"]')?.textContent ?? ''
      const blob = `${refText} ${card?.textContent ?? ''} ${href}`
      if (norm(blob).includes(target)) return href
    }
    return null
  }, sku)

  return found && isProductPageUrl(found) ? found : null
}

async function verifyLoggedIn(page) {
  await page.goto('https://gruposdm.com/es/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1000)
  const hint = await page.evaluate(() => {
    const t = document.body.innerText.toLowerCase()
    if (/cerrar sesi[oó]n|logout|sign out/.test(t)) return 'logout'
    if (/iniciar sesi[oó]n/.test(t) && !/cerrar sesi[oó]n/.test(t)) return 'guest'
    return 'unknown'
  })
  if (hint === 'logout') return true
  if (hint === 'guest') return false

  await page.goto('https://gruposdm.com/es/buscar?controller=search&s=794.SFINGMTNE', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForTimeout(DELAY_MS)
  const firstProduct = await page.evaluate(() => {
    const a = document.querySelector(
      '#js-product-list a[href*=".html"], .product-miniature a[href*=".html"]',
    )
    return a?.href?.split('?')[0] ?? null
  })
  if (!firstProduct) return false

  await page.goto(firstProduct, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(DELAY_MS)
  const scraped = await scrapeGrupoSDMProduct(page)
  return scraped.cost != null
}

async function fetchCatalogProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, supplier, supplier_sku, supplier_product_url, cost_price, price, stock, is_active',
    )
    .or('supplier.eq.gruposdm,supplier.eq.operativas-sniper,supplier.ilike.%grupo%')
    .order('name')

  if (error) throw new Error(error.message)

  return data ?? []
}

function buildUpdates(product, scraped) {
  const updates = {}
  const notes = []

  if (scraped.cost != null) {
    const newCost = roundEuros(scraped.cost)
    if (product.cost_price == null || Math.abs(Number(product.cost_price) - newCost) >= 0.01) {
      updates.cost_price = newCost
      notes.push(`coste ${product.cost_price ?? '—'} → ${newCost}€`)
    }

    const minPrice = minPvpForNetProfit(newCost)
    const currentPrice = Number(product.price)
    if (currentPrice < minPrice) {
      updates.price = minPrice
      notes.push(`PVP ${currentPrice} → ${minPrice}€`)
    }
  }

  if (scraped.stock != null && scraped.stock !== product.stock) {
    updates.stock = scraped.stock
    notes.push(`stock ${product.stock} → ${scraped.stock}`)
  }

  if (scraped.unavailable && product.is_active) {
    updates.is_active = false
    notes.push('desactivado (sin stock / consultar en proveedor)')
  } else if (!scraped.unavailable && scraped.stock > 0 && !product.is_active) {
    updates.is_active = true
    notes.push('reactivado')
  }

  return { updates, notes }
}

async function main() {
  const products = await fetchCatalogProducts()
  const batch = LIMIT != null && LIMIT > 0 ? products.slice(0, LIMIT) : products

  console.log(DRY_RUN ? '=== DRY RUN — Grupo SDM ===' : '=== SINCRONIZAR Grupo SDM ===')
  console.log(`${batch.length} producto(s) Grupo SDM en catálogo\n`)

  if (batch.length === 0) {
    console.log('No hay productos de Grupo SDM en la base de datos')
    process.exit(0)
  }

  const missingUrl = batch.filter((p) => !p.supplier_product_url?.includes('gruposdm.com'))
  if (missingUrl.length > 0) {
    console.log(`ℹ️  ${missingUrl.length} sin URL guardada — se buscarán por SKU en Grupo SDM\n`)
  }

  const profileDir = path.join(__dirname, '.gruposdm-browser-profile')
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    args: ['--start-maximized'],
    viewport: null,
  })
  const page = context.pages()[0] ?? (await context.newPage())

  try {
    if (WAIT_SECONDS != null && WAIT_SECONDS > 0) {
      console.log(`🌐 Abriendo login — tienes ${WAIT_SECONDS}s para iniciar sesión en el navegador…\n`)
      await page.goto('https://gruposdm.com/es/iniciar-sesion', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })
      await page.waitForTimeout(WAIT_SECONDS * 1000)
    } else if (!READY) {
      console.log('🌐 Abriendo Grupo SDM…')
      await page.goto('https://gruposdm.com/es/iniciar-sesion', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })

      console.log('\n📋 INSTRUCCIONES:')
      console.log('   1. Inicia sesión en el navegador con tu cuenta de mayorista')
      console.log('   2. Comprueba que ves precios (no "Consultar" sin importe)')
      console.log('   3. Vuelve aquí y pulsa ENTER para empezar el análisis\n')

      await waitForEnter('   Pulsa ENTER cuando hayas iniciado sesión… ')
    } else {
      console.log('✅ Continuando (--ready): usando perfil .gruposdm-browser-profile\n')
    }

    const loggedIn = await verifyLoggedIn(page)
    if (!loggedIn) {
      console.error('❌ No hay sesión activa. Usa --wait-seconds=90 o inicia sesión y pulsa ENTER.')
      process.exit(1)
    }
    console.log('🔐 Sesión detectada — analizando catálogo…\n')

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const product of batch) {
      process.stdout.write(`\n📦 ${product.name.slice(0, 55)}\n`)

      try {
        const url = await resolveProductUrl(page, product)
        if (!url) {
          console.log(`   ⚠️  Sin URL ni resultado de búsqueda (SKU: ${product.supplier_sku ?? '—'})`)
          failed++
          continue
        }

        if (url !== product.supplier_product_url?.trim()) {
          console.log(`   🔗 ${url.slice(0, 72)}…`)
        }

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await page.waitForTimeout(DELAY_MS)

        const scraped = await scrapeGrupoSDMProduct(page)

        if (scraped.cost == null) {
          console.log('   ⚠️  No se leyó precio mayorista (¿sesión caducada?)')
          failed++
          continue
        }

        const { updates, notes } = buildUpdates(product, scraped)

        if (url !== product.supplier_product_url?.trim()) {
          updates.supplier_product_url = url
          notes.unshift('URL proveedor guardada')
        }

        console.log(
          `   Coste proveedor: ${scraped.cost}€ · Stock: ${scraped.stock ?? '?'} · SKU web: ${scraped.sku ?? '—'}`,
        )

        if (Object.keys(updates).length === 0) {
          console.log('   ✓ Sin cambios')
          skipped++
          continue
        }

        console.log(`   → ${notes.join(' · ')}`)

        if (!DRY_RUN) {
          const { error } = await supabase.from('products').update(updates).eq('id', product.id)
          if (error) {
            console.log(`   ❌ ${error.message}`)
            failed++
          } else {
            updated++
          }
        } else {
          updated++
        }
      } catch (err) {
        console.log(`   ❌ ${err.message}`)
        failed++
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Resumen: ${DRY_RUN ? 'simulación' : 'actualizados'} ${updated} · sin cambios ${skipped} · errores ${failed}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } finally {
    await context.close()
  }
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})
