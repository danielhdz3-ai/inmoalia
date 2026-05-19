#!/usr/bin/env node
/**
 * IMPORTADOR AUTOMÁTICO DE PRODUCTOS DESDE GRUPO SDM
 * 
 * Este script extrae información completa de productos directamente 
 * del catálogo de Grupo SDM (requiere sesión autenticada en navegador).
 * 
 * USO:
 *   node scripts/import-from-gruposdm.mjs <URL_PRODUCTO>
 * 
 * EJEMPLO:
 *   node scripts/import-from-gruposdm.mjs https://gruposdm.com/es/oficinas/.../mesa-cadore.html
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Pregunta al usuario por input en la terminal
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

/**
 * Genera slug único a partir del nombre del producto
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

/**
 * Extrae número de imagen de una URL de Grupo SDM
 * Ejemplo: https://gruposdm.com/36545-large_default/mesa.jpg -> "36545"
 */
function extractImageNumber(url) {
  const match = url.match(/\/(\d+)-(large_default|medium_default|thickbox)/i)
  return match ? match[1] : null
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE IMPORTACIÓN
// ============================================================================

async function importProductFromURL(productURL) {
  console.log('\n🔍 EXTRAYENDO INFORMACIÓN DEL PRODUCTO...\n')
  console.log(`URL: ${productURL}\n`)

  // NOTA: Esta información debe ser extraída manualmente del navegador
  // o proporcionada por el agente de IA que tiene acceso al browser
  
  console.log('⚠️  INSTRUCCIONES:')
  console.log('    El agente de IA extraerá la información automáticamente.')
  console.log('    Por favor proporciona los datos del producto:\n')

  // Solicitar datos del producto
  const sku = await askQuestion('SKU (ej: 714.MCAD180BL): ')
  const name = await askQuestion('Nombre completo: ')
  const description = await askQuestion('Descripción: ')
  const dimensions = await askQuestion('Dimensiones (ej: 180 x 85 x 75 cm): ')
  const weight = await askQuestion('Peso (ej: 55.4 kg): ')
  const wholesalePrice = parseFloat(await askQuestion('Precio mayorista (€): '))
  const margin = parseFloat(await askQuestion('Margen de ganancia (% ej: 40): '))
  
  console.log('\n📸 URLs de imágenes (ingresa una por línea, línea vacía para terminar):')
  const imageURLs = []
  while (true) {
    const url = await askQuestion(`   Imagen ${imageURLs.length + 1}: `)
    if (!url.trim()) break
    imageURLs.push(url.trim())
  }

  // Calcular precio final
  const finalPrice = wholesalePrice * (1 + margin / 100)

  // Generar slug
  const slug = generateSlug(name)

  // Datos del producto
  const productData = {
    sku,
    name,
    slug,
    description,
    price: parseFloat(finalPrice.toFixed(2)),
    cost: wholesalePrice,
    stock: 999, // Stock alto por defecto (dropshipping)
    category_id: null, // Se asignará manualmente después
    images: imageURLs,
    metadata: {
      dimensions,
      weight,
      supplier: 'Grupo SDM',
      source_url: productURL,
      imported_at: new Date().toISOString()
    }
  }

  console.log('\n📦 PRODUCTO A IMPORTAR:\n')
  console.log(JSON.stringify(productData, null, 2))

  const confirm = await askQuestion('\n¿Confirmar importación? (s/n): ')
  
  if (confirm.toLowerCase() !== 's') {
    console.log('\n❌ Importación cancelada.')
    return
  }

  // Insertar en base de datos
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()

  if (error) {
    console.error('\n❌ ERROR AL IMPORTAR:', error.message)
    return
  }

  console.log('\n✅ PRODUCTO IMPORTADO EXITOSAMENTE!\n')
  console.log(`   ID: ${data[0].id}`)
  console.log(`   Slug: ${data[0].slug}`)
  console.log(`   URL: https://www.inmoalia.com/productos/${data[0].slug}`)
  console.log('\n⚠️  PENDIENTE: Asignar categoría en Supabase Dashboard')
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

const productURL = process.argv[2]

if (!productURL) {
  console.error('❌ ERROR: Debes proporcionar la URL del producto')
  console.log('\nUSO:')
  console.log('  node scripts/import-from-gruposdm.mjs <URL_PRODUCTO>')
  console.log('\nEJEMPLO:')
  console.log('  node scripts/import-from-gruposdm.mjs https://gruposdm.com/es/oficinas/.../mesa-cadore.html')
  process.exit(1)
}

importProductFromURL(productURL)
  .catch(error => {
    console.error('❌ ERROR FATAL:', error)
    process.exit(1)
  })
