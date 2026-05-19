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

console.log('📥 DESCARGANDO IMÁGENES DE GRUPO SDM\n')

// Crear directorio para imágenes si no existe
const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// Función para descargar imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
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

// Obtener productos con imágenes de Grupo SDM
const { data: products, error } = await supabase
  .from('products')
  .select('id, slug, images')
  .eq('supplier', 'gruposdm')
  .eq('is_active', true)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📦 Productos a procesar: ${products.length}\n`)

let totalDownloaded = 0
let totalFailed = 0

for (const product of products) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📦 ${product.slug}`)
  
  if (!product.images || product.images.length === 0) {
    console.log('   ⚠️  Sin imágenes')
    continue
  }
  
  const newImages = []
  
  for (let i = 0; i < product.images.length; i++) {
    const imageUrl = product.images[i]
    const filename = `${product.slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    const publicUrl = `/imagenes/productos/${filename}`
    
    try {
      console.log(`   📥 Descargando imagen ${i + 1}/${product.images.length}...`)
      await downloadImage(imageUrl, filepath)
      newImages.push(publicUrl)
      totalDownloaded++
      console.log(`   ✅ Guardada: ${publicUrl}`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      totalFailed++
    }
  }
  
  // Actualizar producto con nuevas URLs
  if (newImages.length > 0) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: newImages })
      .eq('id', product.id)
    
    if (updateError) {
      console.log(`   ❌ Error actualizando: ${updateError.message}`)
    } else {
      console.log(`   ✅ Producto actualizado con ${newImages.length} imágenes locales`)
    }
  }
  
  console.log()
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📊 RESUMEN:`)
console.log(`   ✅ Imágenes descargadas: ${totalDownloaded}`)
console.log(`   ❌ Errores: ${totalFailed}`)
console.log(`   📁 Guardadas en: ${imagesDir}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
