#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, count } = await supabase
  .from('products')
  .select('name, sku, price, cost_price, category', { count: 'exact' })
  .eq('is_active', true)
  .order('created_at', { ascending: false })

console.log(`\n📦 CATÁLOGO TOTAL: ${count} PRODUCTOS ACTIVOS\n`)

data?.forEach((p, i) => {
  const margin = p.cost_price ? (p.price - p.cost_price).toFixed(2) : 'N/A'
  console.log(`${i + 1}. ${p.name}`)
  console.log(`   SKU: ${p.sku} | ${p.price}€ (margen: +${margin}€) | ${p.category}`)
})

console.log(`\n✅ TOTAL: ${count} productos disponibles para vender`)
