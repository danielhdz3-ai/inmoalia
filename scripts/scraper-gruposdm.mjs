#!/usr/bin/env node
/**
 * SCRAPER AUTOMÁTICO DE GRUPO SDM
 * 
 * Este script permite al agente de IA extraer información de productos
 * desde el navegador autenticado del usuario.
 * 
 * REQUISITOS:
 * - Usuario debe estar logueado en gruposdm.com en el navegador de VS Code
 * - El agente de IA debe tener acceso al navegador (pageId)
 * 
 * FLUJO:
 * 1. Usuario proporciona URL o SKU del producto
 * 2. Script extrae toda la información automáticamente
 * 3. Calcula precio final con margen
 * 4. Inserta en base de datos
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Estructura de datos que el agente IA debe extraer del navegador
 */
export const PRODUCT_EXTRACTION_SCHEMA = {
  sku: 'string',           // Referencia del producto (ej: 714.MCAD180BL)
  name: 'string',          // Nombre completo
  description: 'string',   // Descripción larga del producto
  dimensions: 'string',    // Dimensiones (ej: "180 x 85 x 75 cm")
  weight: 'string',        // Peso (ej: "55.4 kg")
  material: 'string',      // Material principal
  wholesalePrice: 'number', // Precio mayorista en €
  imageURLs: 'string[]',   // Array de URLs de imágenes (large_default)
  sourceURL: 'string'      // URL original del producto
}

/**
 * Genera slug único a partir del nombre del producto
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Inserta producto en la base de datos
 * 
 * @param {Object} extractedData - Datos extraídos por el agente IA
 * @param {number} marginPercent - Margen de ganancia (default 40%)
 */
export async function insertProduct(extractedData, marginPercent = 40) {
  const {
    sku,
    name,
    description,
    dimensions,
    weight,
    material,
    wholesalePrice,
    imageURLs,
    sourceURL
  } = extractedData

  // Calcular precio final
  const finalPrice = wholesalePrice * (1 + marginPercent / 100)

  // Generar slug
  const slug = generateSlug(name)

  // Preparar datos
  const productData = {
    sku,
    name,
    slug,
    description,
    price: parseFloat(finalPrice.toFixed(2)),
    cost: wholesalePrice,
    stock: 999, // Stock alto (dropshipping)
    category_id: null, // Asignar después
    images: imageURLs,
    metadata: {
      dimensions,
      weight,
      material,
      supplier: 'Grupo SDM',
      source_url: sourceURL,
      margin_percent: marginPercent,
      imported_at: new Date().toISOString()
    }
  }

  console.log('\n📦 PRODUCTO A IMPORTAR:\n')
  console.log(JSON.stringify(productData, null, 2))
  console.log('\n')

  // Insertar en base de datos
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()

  if (error) {
    console.error('❌ ERROR AL IMPORTAR:', error.message)
    throw error
  }

  console.log('✅ PRODUCTO IMPORTADO EXITOSAMENTE!\n')
  console.log(`   ID: ${data[0].id}`)
  console.log(`   Slug: ${data[0].slug}`)
  console.log(`   Precio: ${data[0].price}€ (costo: ${data[0].cost}€, margen: ${marginPercent}%)`)
  console.log(`   URL: https://www.inmoalia.com/productos/${data[0].slug}`)

  return data[0]
}

/**
 * Ejemplo de uso con datos ya extraídos
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  // Ejemplo de datos extraídos (normalmente vienen del agente IA)
  const exampleData = {
    sku: '714.MCAD180BL',
    name: 'Mesa de oficina CADORE, vidrio templado super blanco, 180 x 85 cm',
    description: 'Mesa de oficina moderna, vidrio templado de 12 mm de espesor de color super blanco, armazón de acero inoxidable con acabado pulido brillante.',
    dimensions: '180 x 85 x 75 cm',
    weight: '55.4 kg',
    material: 'Vidrio templado super blanco 12mm, acero inoxidable pulido',
    wholesalePrice: 246.75,
    imageURLs: [
      'https://gruposdm.com/36545-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg',
      'https://gruposdm.com/36546-large_default/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.jpg'
    ],
    sourceURL: 'https://gruposdm.com/es/oficinas/muebles-de-oficina/mesas-de-oficina/mesa-de-oficina-cadore-vidrio-templado-super-blanco-180-x-85-cms.html'
  }

  console.log('🔍 EJEMPLO DE IMPORTACIÓN AUTOMÁTICA\n')
  console.log('Datos extraídos del navegador:\n')
  console.log(JSON.stringify(exampleData, null, 2))
  console.log('\n⚠️  Este es solo un ejemplo. El agente IA extraerá datos reales.\n')
}

export default insertProduct
