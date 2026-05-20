/**
 * Renombra categoría muebles → hogar en Supabase.
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

await supabase.from('categories').update({
  slug: 'hogar',
  name: 'Hogar',
  description: 'Sofás, salón y piezas para completar tu hogar con estilo.',
}).eq('slug', 'muebles')

const { count } = await supabase
  .from('products')
  .update({ category: 'hogar' })
  .eq('category', 'muebles')
  .select('*', { count: 'exact', head: true })

const { data: withPrev } = await supabase
  .from('products')
  .select('id, tags')
  .contains('tags', ['prev_cat:muebles'])

for (const row of withPrev ?? []) {
  const tags = (row.tags ?? []).map((t) => (t === 'prev_cat:muebles' ? 'prev_cat:hogar' : t))
  await supabase.from('products').update({ tags }).eq('id', row.id)
}

console.log(`Productos actualizados a hogar: ${count ?? '?'}`)
console.log(`Tags prev_cat corregidos: ${withPrev?.length ?? 0}`)
