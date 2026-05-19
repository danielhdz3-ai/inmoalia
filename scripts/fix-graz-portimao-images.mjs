/**
 * Descargar correctamente las imágenes de GRAZ y PORTIMAO
 */

import { createClient } from '@supabase/supabase-js'
import https from 'https'
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

// Mapeo de slugs a URLs originales de Grupo SDM
const imagesMap = {
  'sillon-ergonomico-graz-blanco-negro': [
    'https://gruposdm.com/79417-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/79418-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/79419-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'
  ],
  'sillon-gaming-portimao-amarillo-negro': [
    'https://gruposdm.com/79401-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg',
    'https://gruposdm.com/79402-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg',
    'https://gruposdm.com/79403-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg'
  ]
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://gruposdm.com/'
      }
    }
    
    const file = fs.createWriteStream(filepath)
    
    https.get(options, (response) => {
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

console.log('📥 DESCARGANDO IMÁGENES DE GRAZ Y PORTIMAO\n')

for (const [slug, urls] of Object.entries(imagesMap)) {
  console.log(`\n📦 ${slug}`)
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const filename = `${slug}-${i + 1}.jpg`
    const filepath = path.join(imagesDir, filename)
    
    try {
      console.log(`   ${i + 1}/${urls.length}: Descargando...`)
      await downloadImage(url, filepath)
      const stats = fs.statSync(filepath)
      console.log(`   ✅ ${filename} (${Math.round(stats.size / 1024)} KB)`)
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

console.log('\n✅ Descarga completada')
