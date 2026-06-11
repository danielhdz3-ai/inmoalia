/**
 * Alta del sillón UTRECH alto negro malla y tejido negro (794.SUTRECNNE).
 * Imágenes vía CDN gruposdm.com (no requiere deploy de /public).
 * PVP: coste + transporte (tramo SDM) + 60 € neto mínimo + IVA 21 %.
 *
 * Uso: node --env-file=.env.local scripts/add-utrech-negro-malla-tejido.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPricingBreakdown } from './lib/supplier-pricing.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const SLUG = 'sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro'
const SUPPLIER_SKU = '794.SUTRECNNE'
const COST = 52.7
const STOCK = 102
const pricing = getPricingBreakdown(COST)

const DESCRIPTION = `Sillón de oficina moderno con cabezal. Regulación de altura mediante cilindro neumático. Mecanismo de basculación con mando de ajuste de la intensidad. Armazón y base de polipropileno reforzado con fibra de vidrio de color negro. Tapizado del respaldo en malla con diseño horizontal de color negro, asiento en tejido acrílico negro. Otros colores disponibles; sobre pedido podemos suministrar en otros colores. Como silla de visita puede usar el modelo Clifford y Risley. Si lo desea podemos suministrar topes en vez de ruedas.

Dimensiones (cm): ancho 64, fondo 61, alto 112–123. Embalaje: plástico y cartón. Unidad: 1 · volumen: 0,12 m³. Producto nuevo con certificado (test report) emitido por laboratorio internacional homologado, con detalle del cumplimiento de la norma UNE o su equivalente internacional.`

const product = {
  slug: SLUG,
  name: 'Sillón de oficina UTRECH, alto · negro · malla y tejido negro',
  description: DESCRIPTION,
  price: pricing.pvp,
  cost_price: COST,
  images: [
    'https://gruposdm.com/39067-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/37554-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/37555-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
    'https://gruposdm.com/37556-large_default/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.jpg',
  ],
  category: 'sillas',
  subcategory: 'Sillas de oficina',
  tags: ['oficina', 'sillón', 'Utrech', 'malla', 'negro', 'basculante', 'ergonómico', 'cabezal', 'pvp_ref'],
  sku: 'INM-SUTRECNNE',
  supplier_sku: SUPPLIER_SKU,
  supplier: 'gruposdm',
  stock: STOCK,
  dimensions: { width: 64, height: 123, depth: 61 },
  material: 'Polipropileno reforzado con fibra de vidrio, malla, tejido acrílico',
  color: 'Negro',
  is_active: true,
  is_featured: false,
  meta_title: 'Sillón de oficina UTRECH alto negro malla y tejido | INMOALIA',
  meta_desc: 'Sillón UTRECH alto con cabezal, basculante y malla negra. 64×61×112–123 cm. IVA incluido. Certificación UNE.',
  supplier_product_url:
    'https://gruposdm.com/es/oficinas/sillas-de-oficinas/sillones-de-direccion/sillon-de-oficina-utrech-alto-negro-malla-y-tejido-negro.html',
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
console.log(`   Stock: ${STOCK} uds. | Imágenes CDN: ${product.images.length}`)
console.log(`   SKU proveedor: ${SUPPLIER_SKU}`)
