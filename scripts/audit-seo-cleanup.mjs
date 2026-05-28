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

const { data: testProducts } = await supabase
  .from('products')
  .select('slug, name, is_active, tags')
  .or('slug.ilike.%prueba%,slug.ilike.%test%,tags.cs.{test},tags.cs.{prueba}')

console.log('=== Productos test/prueba ===')
for (const p of testProducts ?? []) {
  console.log(`${p.is_active ? 'ACTIVO' : 'inactivo'} | ${p.slug} | ${p.name}`)
}

const { data: inactive } = await supabase
  .from('products')
  .select('slug')
  .eq('is_active', false)

console.log(`\n=== Productos inactivos (${inactive?.length ?? 0}) ===`)
for (const p of inactive ?? []) console.log(p.slug)

const { data: cats } = await supabase.from('categories').select('slug, is_active').order('slug')
console.log('\n=== Categorías DB ===')
for (const c of cats ?? []) console.log(`${c.is_active ? 'activa' : 'inactiva'} | ${c.slug}`)
