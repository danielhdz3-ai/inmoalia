#!/usr/bin/env node
/**
 * Copia URLs remotas de imágenes → Supabase Storage (bucket product-images)
 * y actualiza la columna products.images con las URLs públicas.
 *
 * Requisitos:
 * - Ejecutada la migración 011_storage_product_images_bucket.sql
 * - Variables en .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (solo servidor, nunca en cliente)
 *
 * Uso:
 *   node scripts/mirror-product-images.mjs sofa-venetto-2-plazas-acero-inoxidable-similpiel-negra
 *   node scripts/mirror-product-images.mjs --remote
 * El flag --remote recorre productos que tengan al menos una URL http(s) ajena al bucket ya espejado.
 */

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) {
    console.error('No se encontró .env.local en la raíz del proyecto.')
    process.exit(1)
  }
  const env = {}
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"'))
      || (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    env[k] = v
  }
  return env
}

function extFromType(ct, fallbackUrl) {
  if (ct?.includes('png')) return 'png'
  if (ct?.includes('webp')) return 'webp'
  if (ct?.includes('gif')) return 'gif'
  const m = /\.(jpe?g|png|webp|gif)(\?|#|$)/i.exec(fallbackUrl)
  if (!m) return 'jpg'
  const e = m[1].toLowerCase()
  return e === 'jpeg' ? 'jpg' : e
}

function alreadyMirroredToBucket(u) {
  return typeof u === 'string' && u.includes('/object/public/product-images/')
}

async function mirrorUrl(supabase, imageUrl, slug, index) {
  const res = await fetch(imageUrl, {
    headers: {
      accept: 'image/*',
      'user-agent':
        'InmoaliaProductMirror/1.0 (supplier catalog image copy for storefront)',
    },
  })
  if (!res.ok) {
    throw new Error(`GET ${imageUrl} → HTTP ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const ext = extFromType(res.headers.get('content-type'), imageUrl)
  const objectPath = `${slug}/${String(index).padStart(2, '0')}.${ext}`
  const contentType = res.headers.get('content-type') || `image/${ext === 'jpg' ? 'jpeg' : ext}`

  const { error: upErr } = await supabase.storage
    .from('product-images')
    .upload(objectPath, buf, { contentType, upsert: true })

  if (upErr) throw upErr

  const { data } = supabase.storage.from('product-images').getPublicUrl(objectPath)
  return data.publicUrl
}

async function main() {
  const env = loadEnvLocal()
  const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }

  const supabase = createClient(baseUrl, serviceKey)
  const arg = process.argv[2]

  let slugs = []
  if (arg === '--remote') {
    const { data, error } = await supabase.from('products').select('slug, images')
    if (error) throw error
    for (const row of data || []) {
      const imgs = Array.isArray(row.images) ? row.images : []
      const needs = imgs.some(
        (u) =>
          typeof u === 'string'
          && /^https?:\/\//i.test(u)
          && !alreadyMirroredToBucket(u)
      )
      if (needs) slugs.push(row.slug)
    }
    console.log(`Productos con al menos una imagen remota por espejar: ${slugs.length}`)
  } else if (arg) {
    slugs = [arg]
  } else {
    console.error('Uso: node scripts/mirror-product-images.mjs <slug> | --remote')
    process.exit(1)
  }

  for (const slug of slugs) {
    console.log(`\n→ ${slug}`)
    const { data: product, error } = await supabase
      .from('products')
      .select('slug, images')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    if (!product) {
      console.warn('  (sin producto)')
      continue
    }

    const imgs = Array.isArray(product.images) ? product.images : []
    const newUrls = []
    let uploadIdx = 0

    for (const u of imgs) {
      if (typeof u !== 'string' || !/^https?:\/\//i.test(u)) {
        continue
      }
      if (alreadyMirroredToBucket(u)) {
        newUrls.push(u)
        continue
      }
      await new Promise((r) => setTimeout(r, 400))
      const pub = await mirrorUrl(supabase, u, slug, uploadIdx)
      console.log(`  subida ${uploadIdx}: ${pub}`)
      newUrls.push(pub)
      uploadIdx += 1
    }

    if (newUrls.length === 0) {
      console.warn('  Sin URLs válidas que actualizar.')
      continue
    }

    const { error: uErr } = await supabase
      .from('products')
      .update({ images: newUrls, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    if (uErr) throw uErr
    console.log('  products.images actualizado.')
  }
}

await main()
