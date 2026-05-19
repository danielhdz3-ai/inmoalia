#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data } = await supabase
  .from('products')
  .select('name, slug, description')
  .eq('is_active', true)
  .order('created_at', { ascending: false })

console.log('📝 ANÁLISIS SEO - DESCRIPCIONES DE PRODUCTOS\n')

let cortas = 0
let optimas = 0

data.forEach(p => {
  const len = p.description?.length || 0
  const status = len < 200 ? '❌ CORTA' : len < 500 ? '⚠️  MEDIA' : '✅ ÓPTIMA'
  
  if (len < 500) cortas++
  else optimas++
  
  console.log(`${status} ${p.name.substring(0, 45).padEnd(45)} (${len} chars)`)
})

console.log(`\n📊 RESUMEN:`)
console.log(`   ❌ Necesitan optimización: ${cortas}`)
console.log(`   ✅ Ya optimizadas (500+): ${optimas}`)
console.log(`   📦 Total: ${data.length}`)
