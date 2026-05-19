/**
 * Script completo para sincronizar STOCK e IMÁGENES de Grupo SDM
 * - Hace login automático
 * - Extrae stock REAL de TODOS los productos
 * - Descarga imágenes de GRAZ y PORTIMAO
 * - Actualiza la base de datos
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')

// Mapeo de SKUs de Grupo SDM a información del producto
const GRUPOSDM_PRODUCTS = {
  // GRAZ - necesita imágenes
  '794-SGRBMTNE': {
    slug: 'sillon-ergonomico-graz-blanco-negro',
    url: 'https://gruposdm.com/sillones/14825-sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro-8435588281258.html',
    needsImages: true,
    imageIds: [79417, 79418, 79419]
  },
  // PORTIMAO - necesita imágenes
  '712-SPORSAMNE': {
    slug: 'sillon-gaming-portimao-amarillo-negro',
    url: 'https://gruposdm.com/sillones/14823-sillon-gaming-portimao-amarillo-y-negro-8435588281234.html',
    needsImages: true,
    imageIds: [79401, 79402, 79403]
  },
  // Productos de las 5 sillas nuevas (stock hardcoded 999)
  '794.SFINGMTNE': {
    url: 'https://gruposdm.com/sillones/14816-sillon-de-oficina-fiss-new-negro-con-malla-y-tejido-negro-8435588281173.html'
  },
  '794.SFIBGMTVP': {
    url: 'https://gruposdm.com/sillones/14812-sillon-de-oficina-fiss-new-blanco-con-malla-y-tejido-verde-8435588281135.html'
  },
  '794.SRISNNRO': {
    url: 'https://gruposdm.com/sillones/14822-sillon-de-oficina-risley-negro-con-malla-negra-y-tejido-rojo-deportivo-8435588281227.html'
  },
  '762.SCLBGMTVE': {
    url: 'https://gruposdm.com/sillones/13972-sillon-de-oficina-clent-blanco-con-malla-y-tejido-verde-moderno-8435588280381.html'
  },
  '762.SMELLNMNE': {
    url: 'https://gruposdm.com/sillones/13961-sillon-ejecutivo-de-oficina-mellac-alto-negro-con-malla-y-asiento-negro-8435588280275.html'
  }
}

async function login(page) {
  console.log('🔐 Abriendo Grupo SDM...')
  
  try {
    await page.goto('https://gruposdm.com', { waitUntil: 'load', timeout: 15000 })
  } catch (e) {
    console.log('⚠️ Timeout inicial - la página puede estar cargando lentamente')
  }
  
  await page.waitForTimeout(2000)
  
  // Esperar que el usuario haga login manualmente
  console.log('\n⏳ INSTRUCCIONES:')
  console.log('   1. Haz clic en "Mi cuenta" o "Iniciar sesión" en el navegador')
  console.log('   2. Inicia sesión con tus credenciales')
  console.log('   3. Espera a que cargue tu panel de usuario')
  console.log('   4. Presiona ENTER aquí en la terminal cuando hayas iniciado sesión\n')
  
  // Esperar input del usuario
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve())
  })
  
  console.log('✅ Login completado - continuando...\n')
}

async function extractStock(page, productUrl, sku) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Intentar extraer stock de la página del producto
    // Buscar en el bloque de disponibilidad
    const stockText = await page.evaluate(() => {
      // Buscar en varios selectores posibles
      const selectors = [
        '.product-quantities',
        '.product-availability',
        '[data-stock]',
        '.stock-info',
        '#quantity_wanted_p'
      ]
      
      for (const selector of selectors) {
        const el = document.querySelector(selector)
        if (el) {
          return el.textContent || el.getAttribute('data-stock')
        }
      }
      
      // Buscar en todo el HTML si no encuentra en los selectores
      const bodyText = document.body.textContent || ''
      
      // Buscar patrones como "12 artículos", "En stock: 45", etc.
      const patterns = [
        /(\d+)\s*artículos?/i,
        /en stock[:\s]*(\d+)/i,
        /disponibles?[:\s]*(\d+)/i,
        /stock[:\s]*(\d+)/i,
        /cantidad[:\s]*(\d+)/i
      ]
      
      for (const pattern of patterns) {
        const match = bodyText.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }
      
      // Si no encuentra número pero dice "en stock" o "disponible"
      if (bodyText.toLowerCase().includes('en stock') || 
          bodyText.toLowerCase().includes('disponible')) {
        return 'disponible'
      }
      
      return null
    })
    
    if (stockText) {
      const match = stockText.match(/(\d+)/)
      if (match) {
        const stock = parseInt(match[1], 10)
        console.log(`   ✅ Stock: ${stock} unidades`)
        return stock
      } else if (stockText.toLowerCase().includes('disponible')) {
        console.log(`   ✅ Stock: Disponible (sin cantidad - usando 100)`)
        return 100
      }
    }
    
    console.log('   ⚠️ No se pudo extraer stock - manteniendo actual')
    return null
    
  } catch (err) {
    console.log(`   ❌ Error extrayendo stock: ${err.message}`)
    return null
  }
}

async function downloadProductImages(page, product) {
  console.log(`   📸 Descargando ${product.imageIds.length} imágenes...`)
  
  const downloadedImages = []
  
  for (let i = 0; i < product.imageIds.length; i++) {
    const imageId = product.imageIds[i]
    const filename = `${product.slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    
    try {
      // Primero intentar con -large_default
      let imageUrl = `https://gruposdm.com/${imageId}-large_default/${product.slug.replace(/-/g, '-')}.jpg`
      
      let response = await page.goto(imageUrl, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      })
      
      // Si falla, intentar sin el slug en la URL
      if (!response.ok()) {
        imageUrl = `https://gruposdm.com/${imageId}-large_default/producto.jpg`
        response = await page.goto(imageUrl, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        })
      }
      
      if (response.ok()) {
        const buffer = await response.body()
        
        if (buffer.length > 1000) { // Al menos 1KB para evitar imágenes vacías
          fs.writeFileSync(filepath, buffer)
          const size = Math.round(buffer.length / 1024)
          console.log(`      ✅ ${filename} (${size} KB)`)
          downloadedImages.push(`/imagenes/productos/${filename}`)
        } else {
          console.log(`      ⚠️ ${filename} demasiado pequeño (${buffer.length} bytes)`)
        }
      } else {
        console.log(`      ❌ HTTP ${response.status()} para ${filename}`)
      }
      
      await page.waitForTimeout(500)
      
    } catch (err) {
      console.log(`      ❌ Error: ${err.message}`)
    }
  }
  
  return downloadedImages
}

async function main() {
  console.log('🚀 SINCRONIZACIÓN COMPLETA DE GRUPO SDM\n')
  
  // 1. Obtener todos los productos de Grupo SDM de la base de datos
  console.log('📦 Obteniendo productos de Grupo SDM de la base de datos...')
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('supplier', '%grupo%')
    .eq('is_active', true)
  
  if (error) {
    console.error('❌ Error obteniendo productos:', error)
    process.exit(1)
  }
  
  console.log(`✅ ${products.length} productos encontrados\n`)
  
  // 2. Iniciar navegador
  console.log('🌐 Iniciando navegador Chromium...\n')
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  })
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // 3. Login
  await login(page)
  
  // 4. Procesar cada producto
  const stockUpdates = {}
  const imageUpdates = {}
  
  for (const product of products) {
    console.log(`\n📦 ${product.name}`)
    console.log(`   SKU: ${product.supplier_sku}`)
    
    const productInfo = GRUPOSDM_PRODUCTS[product.supplier_sku]
    
    if (!productInfo) {
      console.log('   ⚠️ Sin información de URL - omitiendo')
      continue
    }
    
    // Extraer stock
    const stock = await extractStock(page, productInfo.url, product.supplier_sku)
    if (stock !== null) {
      stockUpdates[product.id] = stock
    }
    
    // Descargar imágenes si es necesario
    if (productInfo.needsImages) {
      const images = await downloadProductImages(page, productInfo)
      if (images.length > 0) {
        imageUpdates[product.id] = images
      }
    }
    
    await page.waitForTimeout(500)
  }
  
  await browser.close()
  
  // 5. Actualizar base de datos
  console.log('\n\n💾 ACTUALIZANDO BASE DE DATOS...\n')
  
  for (const [productId, stock] of Object.entries(stockUpdates)) {
    const { error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', productId)
    
    if (error) {
      console.log(`❌ Error actualizando stock del producto ${productId}:`, error)
    } else {
      console.log(`✅ Stock actualizado para producto ${productId}: ${stock}`)
    }
  }
  
  for (const [productId, images] of Object.entries(imageUpdates)) {
    const { error } = await supabase
      .from('products')
      .update({ images })
      .eq('id', productId)
    
    if (error) {
      console.log(`❌ Error actualizando imágenes del producto ${productId}:`, error)
    } else {
      console.log(`✅ Imágenes actualizadas para producto ${productId}: ${images.length} imágenes`)
    }
  }
  
  console.log('\n✅ SINCRONIZACIÓN COMPLETADA\n')
  console.log('🔄 Ejecuta ahora:')
  console.log('  git add public/imagenes/productos/')
  console.log('  git commit -m "fix: add GRAZ and PORTIMAO images + update real stock"')
  console.log('  git push origin master')
}

main().catch(console.error)
