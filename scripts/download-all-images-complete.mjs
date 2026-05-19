import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 DESCARGA COMPLETA DE TODAS LAS IMÁGENES\n')

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
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

// Obtener TODOS los productos activos
const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, images')
  .eq('is_active', true)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📦 Productos a procesar: ${products.length}\n`)

let totalDownloaded = 0
let totalFailed = 0
let totalSkipped = 0
const updates = []

for (const product of products) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📦 ${product.slug}`)
  
  if (!product.images || product.images.length === 0) {
    console.log('   ⚠️  Sin imágenes - SALTANDO')
    totalSkipped++
    continue
  }
  
  // Verificar si ya son imágenes locales
  const firstImage = product.images[0]
  if (firstImage.startsWith('/imagenes/')) {
    console.log(`   ✅ Ya tiene imágenes locales (${product.images.length})`)
    totalSkipped++
    continue
  }
  
  const newImages = []
  
  for (let i = 0; i < product.images.length; i++) {
    const imageUrl = product.images[i]
    const filename = `${product.slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    const publicUrl = `/imagenes/productos/${filename}`
    
    // Si ya existe el archivo, reutilizarlo
    if (fs.existsSync(filepath)) {
      console.log(`   ♻️  Ya existe: ${filename}`)
      newImages.push(publicUrl)
      totalSkipped++
      continue
    }
    
    try {
      console.log(`   📥 ${i + 1}/${product.images.length}: Descargando...`)
      await downloadImage(imageUrl, filepath)
      newImages.push(publicUrl)
      totalDownloaded++
      console.log(`   ✅ Guardada: ${filename}`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      totalFailed++
    }
    
    // Pequeño delay para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // Solo actualizar si se descargaron imágenes nuevas
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
      console.log(`   ❌ Error en ${update.slug}: ${error.message}`)
    } else {
      console.log(`   ✅ ${update.slug}: ${update.images.length} imágenes`)
    }
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📊 RESUMEN FINAL:`)
console.log(`   ✅ Imágenes descargadas: ${totalDownloaded}`)
console.log(`   ♻️  Archivos existentes: ${totalSkipped}`)
console.log(`   ❌ Errores: ${totalFailed}`)
console.log(`   💾 Productos actualizados: ${updates.length}`)
console.log(`   📁 Directorio: ${imagesDir}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

if (totalFailed === 0 && totalDownloaded > 0) {
  console.log(`\n✅ TODAS LAS IMÁGENES DESCARGADAS EXITOSAMENTE`)
  console.log(`🚀 Listo para commit y deploy`)
}
