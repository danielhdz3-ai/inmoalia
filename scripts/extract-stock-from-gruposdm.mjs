/**
 * Script para extraer stock real de productos desde Grupo SDM
 * Usa Playwright para navegar las páginas autenticadas
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('📊 EXTRAYENDO STOCK REAL DE GRUPO SDM\n')

// Mapeo de SKUs a URLs de Grupo SDM
const PRODUCT_URLS = {
  '794.SFINGMTNE': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-operacion/sillon-de-oficina-fiss-new-m-negro-basculante-malla-y-tejido-negro.html',
  '794.SFIBGMTVP': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-operacion/sillon-de-oficina-fiss-new-m-blanco-regulacion-de-altura-basculante-malla-y-tejido-verde.html',
  '794.SRISNNRO': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-operacion/sillon-de-oficina-risley-negro-malla-negra-tejido-rojo.html',
  '762.SCLBGMTVE': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-operacion/sillon-de-oficina-clent-blanco-malla-y-tejido-verde.html',
  '762.SMELLNMNE': 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mellac-alto-negro-malla-y-asiento-negro.html',
}

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext()
const page = await context.newPage()

console.log('🌐 Conectando a Grupo SDM...\n')

try {
  // Navegar a la página de login
  await page.goto('https://gruposdm.com/es/iniciar-sesion')
  await page.waitForTimeout(2000)
  
  console.log('⚠️  Por favor inicia sesión manualmente en el navegador')
  console.log('   Presiona ENTER cuando hayas iniciado sesión...')
  
  // Esperar input del usuario
  await new Promise(resolve => {
    process.stdin.once('data', resolve)
  })
  
  console.log('\n📦 Extrayendo stock de productos...\n')
  
  // Obtener productos de la base de datos
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, supplier_sku, stock')
    .eq('supplier', 'gruposdm')
    .eq('is_active', true)
  
  if (error) throw error
  
  const stockUpdates = []
  
  for (const product of products) {
    const url = PRODUCT_URLS[product.supplier_sku]
    
    if (!url) {
      console.log(`⚠️  ${product.name}`)
      console.log(`   SKU: ${product.supplier_sku}`)
      console.log(`   URL no encontrada - mantiene stock: ${product.stock}`)
      console.log()
      continue
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📦 ${product.name}`)
    console.log(`   SKU: ${product.supplier_sku}`)
    console.log(`   Stock actual: ${product.stock}`)
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      
      // Buscar el stock en la página
      const stockText = await page.evaluate(() => {
        // Buscar elemento de stock
        const stockElement = document.querySelector('.product-quantities, .product-availability, .stock-quantity')
        if (stockElement) {
          return stockElement.textContent.trim()
        }
        
        // Buscar en el texto de la página
        const bodyText = document.body.textContent
        const stockMatch = bodyText.match(/(\d+)\s*(unidades?|items?|disponibles?|en stock)/i)
        if (stockMatch) {
          return stockMatch[1]
        }
        
        return null
      })
      
      if (stockText) {
        const stockNumber = parseInt(stockText.match(/\d+/)?.[0] || '0')
        console.log(`   ✅ Stock extraído: ${stockNumber}`)
        stockUpdates.push({ id: product.id, stock: stockNumber })
      } else {
        console.log(`   ⚠️  No se pudo extraer stock - mantiene: ${product.stock}`)
      }
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }
    
    console.log()
  }
  
  // Actualizar stocks en la base de datos
  if (stockUpdates.length > 0) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 ACTUALIZANDO STOCKS EN BASE DE DATOS\n`)
    
    for (const update of stockUpdates) {
      const { error } = await supabase
        .from('products')
        .update({ stock: update.stock })
        .eq('id', update.id)
      
      if (error) {
        console.log(`❌ Error actualizando producto ${update.id}:`, error.message)
      } else {
        console.log(`✅ Producto ${update.id} actualizado a stock: ${update.stock}`)
      }
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 RESUMEN:`)
  console.log(`   ✅ Stocks actualizados: ${stockUpdates.length}`)
  console.log(`   📦 Total productos: ${products.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  
} catch (error) {
  console.error('❌ Error:', error.message)
} finally {
  await browser.close()
}
