/**
 * Descargar imágenes de GRAZ y PORTIMAO desde Grupo SDM con sesión autenticada
 * 
 * INSTRUCCIONES:
 * 1. Ejecutar: npx playwright open https://gruposdm.com
 * 2. Iniciar sesión en Grupo SDM
 * 3. Copiar cookies desde DevTools
 * 4. Pegar las cookies abajo en la variable COOKIES
 * 5. Ejecutar: node scripts/download-graz-portimao-playwright.mjs
 */

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ⚠️ COPIAR TUS COOKIES AQUÍ DESPUÉS DE HACER LOGIN
const COOKIES = [
  // Ejemplo: { name: 'PHPSESSID', value: 'xxx', domain: 'gruposdm.com', path: '/' }
]

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')

const productsToDownload = [
  {
    name: 'Sillón Ergonómico GRAZ Alto Blanco y Negro',
    slug: 'sillon-ergonomico-graz-blanco-negro',
    url: 'https://gruposdm.com/sillones/14825-sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro-8435588281258.html',
    imageIds: [79417, 79418, 79419]
  },
  {
    name: 'Sillón Gaming PORTIMAO Racing Amarillo y Negro',
    slug: 'sillon-gaming-portimao-amarillo-negro',
    url: 'https://gruposdm.com/sillones/14823-sillon-gaming-portimao-amarillo-y-negro-8435588281234.html',
    imageIds: [79401, 79402, 79403]
  }
]

async function downloadProductImages(page, product) {
  console.log(`\n📦 ${product.name}`)
  
  // Navegar a la página del producto
  await page.goto(product.url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  
  // Descargar cada imagen
  for (let i = 0; i < product.imageIds.length; i++) {
    const imageId = product.imageIds[i]
    const imageUrl = `https://gruposdm.com/${imageId}-large_default/${product.slug}.jpg`
    const filename = `${product.slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    
    try {
      console.log(`   ${i + 1}/${product.imageIds.length}: ${imageUrl}`)
      
      const response = await page.goto(imageUrl, { waitUntil: 'networkidle' })
      const buffer = await response.body()
      
      fs.writeFileSync(filepath, buffer)
      const size = Math.round(buffer.length / 1024)
      
      console.log(`   ✅ ${filename} (${size} KB)`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }
    
    await page.waitForTimeout(500)
  }
}

async function main() {
  if (COOKIES.length === 0) {
    console.error('❌ ERROR: Debes copiar tus cookies primero!')
    console.log('\n📋 INSTRUCCIONES:')
    console.log('1. Ejecuta: npx playwright open https://gruposdm.com')
    console.log('2. Inicia sesión en Grupo SDM')
    console.log('3. Abre DevTools (F12) → Application → Cookies → gruposdm.com')
    console.log('4. Copia las cookies importantes (PHPSESSID, etc.)')
    console.log('5. Pégalas en la variable COOKIES de este script')
    console.log('6. Ejecuta nuevamente este script\n')
    process.exit(1)
  }
  
  console.log('🌐 Iniciando navegador...\n')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  
  // Inyectar cookies
  await context.addCookies(COOKIES)
  
  const page = await context.newPage()
  
  console.log('📥 DESCARGANDO IMÁGENES DE GRAZ Y PORTIMAO')
  
  for (const product of productsToDownload) {
    await downloadProductImages(page, product)
  }
  
  console.log('\n✅ Descarga completada')
  console.log('\n🔄 Ejecuta ahora:')
  console.log('  git add public/imagenes/productos/')
  console.log('  git commit -m "fix: add GRAZ and PORTIMAO images"')
  console.log('  git push origin master')
  
  await browser.close()
}

main().catch(console.error)
