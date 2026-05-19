/**
 * Script para extraer imágenes automáticamente desde Grupo SDM
 * usando la sesión de navegador autenticada
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 EXTRACCIÓN AUTOMÁTICA DE IMÁGENES DESDE GRUPO SDM\n')

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

function downloadImage(url, filepath, cookies) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
    
    const file = fs.createWriteStream(filepath)
    
    https.get(options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Seguir redirect
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          https.get(redirectUrl, (res) => {
            res.pipe(file)
            file.on('finish', () => {
              file.close()
              resolve()
            })
          }).on('error', reject)
        }
        return
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

// Conectar al navegador existente
const browser = await chromium.connectOverCDP('http://localhost:9222')
const contexts = browser.contexts()
const context = contexts[0]
const pages = context.pages()
const page = pages[0]

console.log('🌐 Conectado al navegador existente')
console.log(`📄 Página actual: ${page.url()}\n`)

// Obtener cookies de la sesión
const cookies = await context.cookies()
const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')

// Obtener productos con URLs externas
const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, images')
  .eq('is_active', true)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

let totalDownloaded = 0
let totalFailed = 0
const updates = []

for (const product of products) {
  if (!product.images || product.images.length === 0) continue
  
  const firstImage = product.images[0]
  if (!firstImage.startsWith('http')) {
    console.log(`✅ ${product.slug}: Ya tiene imágenes locales`)
    continue
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📦 ${product.slug}`)
  
  const newImages = []
  
  for (let i = 0; i < product.images.length; i++) {
    const imageUrl = product.images[i]
    const filename = `${product.slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    const publicUrl = `/imagenes/productos/${filename}`
    
    try {
      console.log(`   📥 ${i + 1}/${product.images.length}: ${imageUrl}`)
      await downloadImage(imageUrl, filepath, cookieString)
      newImages.push(publicUrl)
      totalDownloaded++
      console.log(`   ✅ Guardada`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      totalFailed++
    }
    
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  if (newImages.length > 0) {
    updates.push({ id: product.id, slug: product.slug, images: newImages })
  }
  
  console.log()
}

// Actualizar base de datos
if (updates.length > 0) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`💾 ACTUALIZANDO BASE DE DATOS\n`)
  
  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ images: update.images })
      .eq('id', update.id)
    
    if (error) {
      console.log(`   ❌ ${update.slug}: ${error.message}`)
    } else {
      console.log(`   ✅ ${update.slug}: ${update.images.length} imágenes`)
    }
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📊 RESUMEN:`)
console.log(`   ✅ Descargadas: ${totalDownloaded}`)
console.log(`   ❌ Errores: ${totalFailed}`)
console.log(`   💾 Productos actualizados: ${updates.length}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

await browser.close()
