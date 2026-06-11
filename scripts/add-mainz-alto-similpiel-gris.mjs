/**
 * Alta del sillón MAINZ alto giratorio similpiel gris (762.SMAINASGR).
 * PVP: coste + transporte (tramo SDM) + 60 € neto mínimo + IVA 21 %.
 *
 * Uso: node --env-file=.env.local scripts/add-mainz-alto-similpiel-gris.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import { getPricingBreakdown } from './lib/supplier-pricing.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const SLUG = 'sillon-de-oficina-mainz-alto-giratorio-similpiel-gris'
const SUPPLIER_SKU = '762.SMAINASGR'
const COST = 132
const STOCK = 38
const pricing = getPricingBreakdown(COST)

const SUPPLIER_URL =
  'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.html'

const SOURCE_IMAGES = [
  'https://gruposdm.com/38294-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38295-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38296-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38297-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38298-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
  'https://gruposdm.com/38299-large_default/sillon-de-oficina-mainz-alto-giratorio-similpiel-gris.jpg',
]

const DESCRIPTION = `Sillón de oficina moderno. Regulación de altura mediante cilindro neumático. Mecanismo de reclinación. Base cromada con ruedas blandas. Tapizado en similpiel de color gris. Otros colores disponibles.

Dimensiones (cm): ancho 65, fondo 58, alto 110–120. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,16 m³. Producto nuevo con certificado (test report) emitido por laboratorio internacional homologado, con detalle del cumplimiento de la norma UNE o su equivalente internacional.`

const imagesDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} ${url}`))
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
  name: 'Sillón de oficina MAINZ, alto · giratorio · similpiel gris',
  description: DESCRIPTION,
  price: pricing.pvp,
  cost_price: COST,
  images: localImages,
  category: 'sillas',
  subcategory: 'Sillas de oficina',
  tags: ['oficina', 'sillón', 'Mainz', 'similpiel', 'gris', 'dirección', 'giratorio', 'pvp_ref'],
  sku: 'INM-SMAINASGR',
  supplier_sku: SUPPLIER_SKU,
  supplier: 'gruposdm',
  stock: STOCK,
  dimensions: { width: 65, height: 120, depth: 58 },
  material: 'Similpiel, acero cromado',
  color: 'Gris',
  is_active: true,
  is_featured: false,
  meta_title: 'Sillón de oficina MAINZ alto similpiel gris | INMOALIA',
  meta_desc: 'Sillón MAINZ alto giratorio en similpiel gris. Base cromada, reclinación y 65×58×110–120 cm. IVA incluido.',
  supplier_product_url: SUPPLIER_URL,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data: bySlug } = await supabase.from('products').select('id').eq('slug', SLUG).maybeSingle()
const { data: bySku } = await supabase
  .from('products')
  .select('id')
  .eq('supplier_sku', SUPPLIER_SKU)
  .maybeSingle()

const existingId = bySlug?.id ?? bySku?.id

let error
if (existingId) {
  ;({ error } = await supabase.from('products').update(product).eq('id', existingId))
} else {
  ;({ error } = await supabase.from('products').insert(product))
}

if (error) {
  console.error('❌ Error en base de datos:', error.message)
  process.exit(1)
}

console.log('\n✅ Producto guardado')
console.log(`   ${product.name}`)
console.log(
  `   Coste ${pricing.coste}€ + transporte ${pricing.transporte}€ + neto ${pricing.neto}€ → base ${pricing.baseImponible}€ + IVA ${pricing.iva}€ → PVP ${pricing.pvp}€`,
)
console.log(`   Stock: ${STOCK} uds. | Imágenes: ${localImages.length}`)
console.log(`   SKU proveedor: ${SUPPLIER_SKU}`)
