/**
 * Alta del sillón VERTON blanco / malla y asiento verde (766.SVEABMAVE).
 * Coste 44,10 € + 45 € ganancia neta = 89,10 € PVP.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}
const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')

const SLUG = 'sillon-oficina-verton-blanco-malla-y-asiento-verde'
const COST = 44.10
const MARGIN = 45
const PRICE = COST + MARGIN
const STOCK = 18

const SOURCE_IMAGES = [
  'https://gruposdm.com/33428-large_default/sillon-de-oficina-verton-blanco-malla-y-asiento-verde.jpg',
  'https://gruposdm.com/33429-large_default/sillon-de-oficina-verton-blanco-malla-y-asiento-verde.jpg',
  'https://gruposdm.com/33430-large_default/sillon-de-oficina-verton-blanco-malla-y-asiento-verde.jpg',
  'https://gruposdm.com/33431-large_default/sillon-de-oficina-verton-blanco-malla-y-asiento-verde.jpg',
]

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', reject)
  })
}

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

const localImages = []
for (let i = 0; i < SOURCE_IMAGES.length; i++) {
  const filename = `${SLUG}-${i + 1}.jpg`
  const filepath = path.join(imagesDir, filename)
  const publicUrl = `/imagenes/productos/${filename}`
  console.log(`📥 Descargando imagen ${i + 1}/${SOURCE_IMAGES.length}...`)
  await downloadImage(SOURCE_IMAGES[i], filepath)
  localImages.push(publicUrl)
  console.log(`   ✅ ${publicUrl}`)
}

const product = {
  slug: SLUG,
  name: 'Sillón de oficina VERTON, blanco · malla y asiento verde',
  description: `Sillón de oficina alto y moderno con cabezal. Regulación de altura mediante cilindro neumático. Mecanismo de basculación con mando de ajuste de la intensidad. Armazón de polipropileno reforzado con fibra de vidrio de color blanco. Base de nylon. Tapizado del respaldo en malla verde, cabezal en similpiel verde y asiento en tejido acrílico verde. Otros colores disponibles; bajo pedido se pueden suministrar otros acabados.

Dimensiones (cm): ancho 60, fondo 62, alto 106–116. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,09 m³. Producto nuevo con certificado (test report) emitido por laboratorio internacional homologado, con detalle del cumplimiento de la norma UNE o su equivalente internacional.`,
  price: PRICE,
  cost_price: COST,
  images: localImages,
  category: 'sillas',
  subcategory: 'Sillas de oficina',
  tags: ['oficina', 'sillón', 'dirección', 'malla', 'Verton', 'blanco', 'verde', 'basculante', 'ergonómico'],
  sku: 'INM-SVEABMAVE',
  supplier_sku: '766.SVEABMAVE',
  supplier: 'gruposdm',
  stock: STOCK,
  dimensions: { width: 60, height: 116, depth: 62 },
  material: 'Polipropileno reforzado con fibra de vidrio, malla, similpiel, tejido acrílico',
  color: 'Blanco y verde',
  is_active: true,
  is_featured: false,
  meta_title: 'Sillón de oficina VERTON blanco malla y asiento verde | INMOALIA',
  meta_desc: 'Sillón de dirección VERTON blanco con malla y asiento verde. Basculante, cabezal y 60×62×106–116 cm. Certificación UNE.',
  supplier_product_url: 'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-verton-blanco-malla-y-asiento-verde.html',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: existing } = await supabase.from('products').select('id').eq('slug', SLUG).maybeSingle()

let error
if (existing) {
  ;({ error } = await supabase.from('products').update(product).eq('id', existing.id))
} else {
  ;({ error } = await supabase.from('products').insert(product))
}

if (error) {
  console.error('❌ Error en base de datos:', error.message)
  process.exit(1)
}

console.log('\n✅ Producto guardado')
console.log(`   ${product.name}`)
console.log(`   Coste: ${COST}€ → PVP: ${PRICE}€ (+${MARGIN}€ ganancia neta)`)
console.log(`   Stock: ${STOCK} uds. | Imágenes: ${localImages.length}`)
console.log(`   SKU proveedor: ${product.supplier_sku}`)
