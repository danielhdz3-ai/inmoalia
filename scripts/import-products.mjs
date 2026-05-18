import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=# ]+)=(.*)$/)
  if (match) {
    process.env[match[1]] = match[2].trim()
  }
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importProducts(jsonFilePath) {
  try {
    console.log('📦 IMPORTADOR DE PRODUCTOS GRUPO SDM\n')
    console.log('='.repeat(60))

    // Leer archivo JSON
    const fullPath = join(__dirname, jsonFilePath)
    const data = JSON.parse(readFileSync(fullPath, 'utf-8'))

    if (!data.productos || !Array.isArray(data.productos)) {
      throw new Error('El JSON debe tener un array "productos"')
    }

    console.log(`\n📄 Archivo: ${jsonFilePath}`)
    console.log(`📊 Productos a importar: ${data.productos.length}\n`)

    let imported = 0
    let errors = 0

    for (const p of data.productos) {
      try {
        console.log(`\n⏳ Procesando: ${p.nombre}`)
        console.log(`   SKU Grupo SDM: ${p.sku_gruposdm}`)
        console.log(`   SKU INMOALIA: ${p.sku_inmoalia}`)
        console.log(`   Precio: ${p.precio_venta}€ (compra: ${p.precio_compra}€)`)

        // Validar campos requeridos
        if (!p.slug || !p.nombre || !p.precio_venta) {
          throw new Error('Faltan campos requeridos (slug, nombre, precio_venta)')
        }

        // Verificar si ya existe
        const { data: existing } = await supabase
          .from('products')
          .select('id, name')
          .eq('slug', p.slug)
          .single()

        if (existing) {
          console.log(`   ⚠️  Ya existe, actualizando...`)
          
          const { error: updateError } = await supabase
            .from('products')
            .update({
              name: p.nombre,
              description: p.descripcion,
              price: p.precio_venta,
              cost_price: p.precio_compra,
              images: p.imagenes || [],
              category: p.categoria,
              subcategory: p.subcategoria,
              tags: p.tags || [],
              sku: p.sku_inmoalia,
              supplier_sku: p.sku_gruposdm,
              supplier: 'grupo-sdm',
              stock: p.stock_estimado || 0,
              weight_kg: p.peso_kg,
              material: p.material,
              color: p.color,
              is_featured: p.destacado || false,
              meta_title: p.meta_title,
              meta_desc: p.meta_description,
              updated_at: new Date().toISOString()
            })
            .eq('slug', p.slug)

          if (updateError) throw updateError
          console.log(`   ✅ Actualizado correctamente`)
        } else {
          console.log(`   ➕ Creando nuevo producto...`)
          
          const { error: insertError } = await supabase
            .from('products')
            .insert({
              slug: p.slug,
              name: p.nombre,
              description: p.descripcion,
              price: p.precio_venta,
              cost_price: p.precio_compra,
              images: p.imagenes || [],
              category: p.categoria,
              subcategory: p.subcategoria,
              tags: p.tags || [],
              sku: p.sku_inmoalia,
              supplier_sku: p.sku_gruposdm,
              supplier: 'grupo-sdm',
              stock: p.stock_estimado || 0,
              weight_kg: p.peso_kg,
              material: p.material,
              color: p.color,
              is_active: true,
              is_featured: p.destacado || false,
              meta_title: p.meta_title,
              meta_desc: p.meta_description,
            })

          if (insertError) throw insertError
          console.log(`   ✅ Creado correctamente`)
        }

        imported++
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`)
        errors++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n✅ IMPORTACIÓN COMPLETADA`)
    console.log(`   Importados: ${imported}`)
    console.log(`   Errores: ${errors}`)

    // Mostrar resumen
    console.log(`\n📊 RESUMEN DE PRODUCTOS EN BASE DE DATOS:\n`)
    const { data: products } = await supabase
      .from('products')
      .select('name, sku, supplier_sku, price, is_active')
      .eq('supplier', 'grupo-sdm')
      .order('created_at', { ascending: false })

    if (products && products.length > 0) {
      products.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`)
        console.log(`   SKU: ${p.sku} | Grupo SDM: ${p.supplier_sku}`)
        console.log(`   Precio: ${p.price}€ | Activo: ${p.is_active ? '✅' : '❌'}`)
        console.log('')
      })
    } else {
      console.log('   ⚠️  No hay productos de Grupo SDM en la base de datos')
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message)
    process.exit(1)
  }
}

// Ejecutar
const jsonFile = process.argv[2] || 'productos-template.json'
console.log(`\n🚀 Iniciando importación desde: ${jsonFile}\n`)

importProducts(jsonFile)
  .then(() => {
    console.log('\n✅ Proceso finalizado correctamente\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
