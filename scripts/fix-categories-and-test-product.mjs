/**
 * Reorganiza categorías + producto test Stripe 5€
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const CHAIR_SLUGS = [
  'sillon-oficina-fiss-new-negro-malla-tejido-negro',
  'sillon-oficina-fiss-new-blanco-malla-tejido-verde',
  'sillon-oficina-risley-negro-malla-negra-tejido-rojo',
  'sillon-oficina-clent-blanco-malla-tejido-verde',
  'sillon-oficina-mellac-alto-negro-malla-asiento-negro',
  'sillon-oficina-verton-blanco-malla-y-asiento-verde',
  'sillon-ejecutivo-bernay-malla-negro',
  'sillon-ergonomico-graz-blanco-negro',
  'sillon-gaming-portimao-amarillo-negro',
  'sillon-oficina-clayton-negro-malla-tejido-negro',
  'sillon-de-oficina-clayton-blanco-malla-gris-tejido-azul-claro',
  'sillon-de-oficina-aranjuez-ergonomico-multifuncion-gris-y-negro',
  'sillon-de-oficina-utrecht-alto-negro-malla-y-tejido-negro',
]

// Sillas en ofertas → categoría sillas, mantienen tag ofertas + pvp_ref
for (const slug of CHAIR_SLUGS) {
  const { data: row } = await supabase.from('products').select('id, tags').eq('slug', slug).maybeSingle()
  if (!row) continue
  const tags = Array.from(new Set([...(row.tags ?? []), 'ofertas', 'sillas']))
  await supabase
    .from('products')
    .update({ category: 'sillas', subcategory: 'Sillas de oficina', tags })
    .eq('id', row.id)
  console.log('✅ silla:', slug)
}

// Activar sillas que estuvieran ocultas
await supabase
  .from('products')
  .update({ is_active: true, category: 'sillas' })
  .in('slug', ['sillon-ergonomico-graz-blanco-negro', 'sillon-gaming-portimao-amarillo-negro'])

// Sofás en ofertas → hogar
const SOFA_SLUGS = [
  'sofa-larios-3-plazas-tejido-corduroy-gris',
  'sofa-larios-2-plazas-tejido-velvet-verde-agua-58',
  'sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra',
  'sofa-larios-3-plazas-tapizado-similpiel-blanca',
]
for (const slug of SOFA_SLUGS) {
  const { data: row } = await supabase.from('products').select('id, tags').eq('slug', slug).maybeSingle()
  if (!row) continue
  const tags = Array.from(new Set([...(row.tags ?? []), 'ofertas']))
  await supabase
    .from('products')
    .update({ category: 'hogar', subcategory: 'Sofás y butacas', tags })
    .eq('id', row.id)
  console.log('✅ sofá:', slug)
}

// Mesas oficina → mesas
const { data: mesasOfi } = await supabase.from('products').select('id, slug').eq('category', 'mesas-oficina')
for (const p of mesasOfi ?? []) {
  await supabase
    .from('products')
    .update({ category: 'mesas', subcategory: 'Mesas de oficina' })
    .eq('id', p.id)
  console.log('✅ mesa:', p.slug)
}

// Almacenamiento → hogar
const { data: almac } = await supabase.from('products').select('id, slug').eq('category', 'almacenamiento-oficina')
for (const p of almac ?? []) {
  await supabase
    .from('products')
    .update({ category: 'hogar', subcategory: 'Almacenaje oficina' })
    .eq('id', p.id)
  console.log('✅ almacenaje:', p.slug)
}

// Producto test Stripe 5€
const testProduct = {
  slug: 'producto-test-stripe-5-euros',
  name: 'Producto test Stripe · 5 €',
  description:
    'Producto de prueba interno para verificar el pago con Stripe. No es un artículo físico: sirve únicamente para comprobar que el checkout funciona correctamente. Tras la prueba puedes solicitar reembolso por email.',
  price: 5,
  cost_price: 0.5,
  images: ['/imagenes/productos/producto-test-stripe-5-euros.jpg'],
  category: 'hogar',
  subcategory: 'Test',
  tags: ['test', 'stripe', 'interno'],
  sku: 'INM-TEST-STRIPE-5',
  supplier_sku: 'TEST-STRIPE-5',
  supplier: 'inmoalia',
  stock: 999,
  is_active: true,
  is_featured: false,
  meta_title: 'Test Stripe 5€ | INMOALIA',
  meta_desc: 'Producto de prueba de 5 euros para verificar pagos Stripe en INMOALIA.',
}

// Crear imagen placeholder SVG simple como JPG path - use a minimal 1x1 or create svg in public
const imgDir = path.join(__dirname, '..', 'public', 'imagenes', 'productos')
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true })
const svgPath = path.join(imgDir, 'producto-test-stripe-5-euros.svg')
if (!fs.existsSync(svgPath)) {
  fs.writeFileSync(
    svgPath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#f9f6f1"/>
  <rect x="80" y="80" width="640" height="640" rx="24" fill="#fff" stroke="#2d4a3e" stroke-width="4"/>
  <text x="400" y="360" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="bold" fill="#2d4a3e">TEST</text>
  <text x="400" y="430" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#6b5344">Stripe 5 €</text>
</svg>`,
  )
}
testProduct.images = ['/imagenes/productos/producto-test-stripe-5-euros.svg']

const { data: existing } = await supabase.from('products').select('id').eq('slug', testProduct.slug).maybeSingle()
if (existing) {
  await supabase.from('products').update(testProduct).eq('id', existing.id)
  console.log('✅ producto test actualizado')
} else {
  await supabase.from('products').insert(testProduct)
  console.log('✅ producto test insertado')
}

console.log('\n--- Resumen ---')
const { data: all } = await supabase.from('products').select('category').eq('is_active', true)
const counts = {}
for (const r of all ?? []) counts[r.category] = (counts[r.category] ?? 0) + 1
console.log(counts)
