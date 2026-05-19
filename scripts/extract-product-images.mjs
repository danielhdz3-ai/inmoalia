/**
 * Script para extraer URLs correctas de imágenes desde Grupo SDM
 * usando Playwright con sesión autenticada
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const GRUPOSDM_BASE = 'https://gruposdm.com/es'

// Mapeo de productos INMOALIA -> SKU Grupo SDM
const PRODUCT_MAPPING = {
  // Sillas
  'sillon-ergonomico-graz-alto-blanco-y-negro': '794.SGRAZANNE',
  'sillon-ejecutivo-bernay-alto-malla-negra': '794.SBERNASNE',
  'sillon-gaming-portimao-racing-amarillo-y-negro': '794.SPORSRAM',
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro': '794.SARANEGRI',
  'sillon-de-oficina-clayton-negro-malla-y-tejido-negro': '794.SCLAYNNNE',
  'sillon-de-oficina-clayton-blanco-malla-gris-y-tejido-gris': '794.SCLAYBGRI',
  'sillon-de-oficina-utrecht-alto-negro-malla': '794.SUTREMANE',
  
  // Mesas
  'mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble': '443.MAREZZ16B',
  'mesa-de-oficina-basilea-vidrio-templado-negro-estructura-cromada': '443.MBASILNE',
  'mesa-de-oficina-magna-forma-a-izquierda-vidrio-templado-negro': '443.MMAGNAZNE',
  'mesa-de-oficina-cadore-vidrio-templado-superior-100x60-cm-color-blanco': '443.MCAD10060',
  'conjunto-mesas-studio-136-y-90-con-2-cajones-miel-y-cacao': '494.MESTUDMYC',
  
  // Almacenamiento
  'armario-arezzo-160-alto-con-2-puertas-blanco-y-roble': '494.AAREZ16OB',
  'archivador-studio-con-3-gavetas-bilaminado-miel-y-cacao': '494.ASTUDIO3B',
  'cajonera-metalica-olimpo-con-ruedas-3-cajones-gris-ral-7035': '494.OLIMPO3GR',
  'armario-metalico-olimpo-puertas-correderas-gris-ral-7035': '494.OLIMP1GRA',
  'armario-studio-alto-puertas-altas-bilaminado-miel-y-cacao': '494.ASTUDIOPA',
  
  // Iluminación
  'lampara-de-pie-omega-cromada-con-base-de-marmol-negro': '443.POMEGACN',
  'lampara-de-pie-italica-diseno-moderno-acrilico': '443.PITALICA',
  
  // Sofás
  'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra': '494.SVENET2NE'
}

async function extractProductImages(page, productSlug, sku) {
  try {
    console.log(`\n🔍 Buscando: ${productSlug} (SKU: ${sku})`)
    
    // Buscar el producto en Grupo SDM
    await page.goto(`${GRUPOSDM_BASE}/catalogsearch/result/?q=${encodeURIComponent(sku)}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    
    await page.waitForTimeout(2000)
    
    // Intentar encontrar el producto en los resultados
    const productLink = await page.evaluate((searchSku) => {
      const articles = Array.from(document.querySelectorAll('article'))
      for (const article of articles) {
        const skuEl = article.querySelector('.product-sku, .product-reference')
        if (skuEl && skuEl.textContent.trim() === searchSku) {
          const link = article.querySelector('a[href*="/oficinas/"], a[href*="/iluminacion/"]')
          return link ? link.href : null
        }
      }
      return null
    }, sku)
    
    if (!productLink) {
      console.log(`   ⚠️ No encontrado en búsqueda, intentando búsqueda manual...`)
      return null
    }
    
    // Navegar al producto
    await page.goto(productLink, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)
    
    // Extraer imágenes
    const imageData = await page.evaluate(() => {
      const images = []
      
      // Buscar imágenes en la galería
      const productImages = document.querySelectorAll('.product-images img, .product-cover img, .images-container img, #product-images img')
      
      productImages.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src')
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          // Convertir a large_default
          const highResSrc = src.replace(/-small_default|-medium_default|-home_default|-cart_default/g, '-large_default')
          images.push(highResSrc)
        }
      })
      
      // Buscar en enlaces de imágenes
      const imageLinks = document.querySelectorAll('a[data-image-large-src]')
      imageLinks.forEach(link => {
        const href = link.getAttribute('data-image-large-src') || link.getAttribute('href')
        if (href && (href.includes('.jpg') || href.includes('.png'))) {
          images.push(href)
        }
      })
      
      // Eliminar duplicados y filtrar solo URLs completas
      return [...new Set(images)].filter(url => url.startsWith('http'))
    })
    
    if (imageData.length > 0) {
      console.log(`   ✅ Encontradas ${imageData.length} imágenes:`)
      imageData.forEach((url, i) => console.log(`      ${i + 1}. ${url}`))
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('products')
        .update({ images: imageData })
        .eq('slug', productSlug)
      
      if (error) {
        console.log(`   ❌ Error al actualizar: ${error.message}`)
        return { slug: productSlug, sku, images: imageData, updated: false, error: error.message }
      }
      
      console.log(`   💾 Actualizado en base de datos`)
      return { slug: productSlug, sku, images: imageData, updated: true }
    } else {
      console.log(`   ⚠️ No se encontraron imágenes`)
      return { slug: productSlug, sku, images: [], updated: false, error: 'No images found' }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { slug: productSlug, sku, images: [], updated: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 EXTRACCIÓN DE IMÁGENES DE GRUPO SDM\n')
  console.log('📦 Conectando con Playwright...')
  
  const browser = await chromium.connectOverCDP('http://localhost:9222')
  const context = browser.contexts()[0]
  const page = context.pages()[0] || await context.newPage()
  
  console.log('✅ Conectado a sesión autenticada de Grupo SDM\n')
  console.log(`📊 Productos a procesar: ${Object.keys(PRODUCT_MAPPING).length}\n`)
  
  const results = []
  
  for (const [slug, sku] of Object.entries(PRODUCT_MAPPING)) {
    const result = await extractProductImages(page, slug, sku)
    results.push(result)
    
    // Pequeña pausa entre productos
    await page.waitForTimeout(1500)
  }
  
  // Resumen
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN:')
  console.log(`   ✅ Actualizados: ${results.filter(r => r.updated).length}`)
  console.log(`   ❌ Errores: ${results.filter(r => !r.updated).length}`)
  console.log(`   📦 Total: ${results.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const errors = results.filter(r => !r.updated)
  if (errors.length > 0) {
    console.log('⚠️ Productos con errores:')
    errors.forEach(e => console.log(`   - ${e.slug}: ${e.error}`))
  }
  
  console.log('\n✨ EXTRACCIÓN COMPLETADA\n')
}

main().catch(console.error)
