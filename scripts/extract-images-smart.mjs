/**
 * Script inteligente para extraer imágenes desde Grupo SDM
 * usando las URLs directamente con autenticación
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 EXTRACCIÓN INTELIGENTE DE IMÁGENES\n')

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// Abrir navegador con sesión persistente
const userDataDir = path.join(__dirname, '.browser-data')
const browser = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 720 }
})

const page = await browser.newPage()

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔐 NECESITAS HACER LOGIN MANUAL EN GRUPO SDM')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('1. Se abrirá el navegador')
console.log('2. Haz login en Grupo SDM si no estás logeado')
console.log('3. Presiona ENTER aquí cuando estés logeado\n')

await page.goto('https://gruposdm.com/es/')

// Esperar a que el usuario haga login
await new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('✅ Presiona ENTER cuando hayas hecho login: ', () => {
    rl.close()
    resolve()
  })
})

console.log('\n🔄 Iniciando extracción de imágenes...\n')

// Obtener productos con URLs externas
const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, images')
  .eq('is_active', true)

if (error) {
  console.error('❌ Error:', error.message)
  await browser.close()
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
      console.log(`   📥 ${i + 1}/${product.images.length}: Descargando...`)
      
      // Navegar a la imagen para descargarla con autenticación
      const response = await page.goto(imageUrl, { waitUntil: 'networkidle' })
      
      if (!response || response.status() !== 200) {
        throw new Error(`HTTP ${response?.status() || 'error'}`)
      }
      
      // Guardar la imagen
      const buffer = await response.body()
      fs.writeFileSync(filepath, buffer)
      
      newImages.push(publicUrl)
      totalDownloaded++
      console.log(`   ✅ Guardada: ${filename}`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      totalFailed++
    }
    
    await page.waitForTimeout(500)
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
console.log(`📊 RESUMEN FINAL:`)
console.log(`   ✅ Descargadas: ${totalDownloaded}`)
console.log(`   ❌ Errores: ${totalFailed}`)
console.log(`   💾 Productos actualizados: ${updates.length}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

await browser.close()
console.log('✅ Proceso completado')
