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

const { data } = await supabase
  .from('products')
  .select('slug, name, category, subcategory')
  .eq('is_active', true)
  .order('category')

const by = {}
for (const p of data ?? []) {
  by[p.category] ??= []
  by[p.category].push(p)
}

for (const [k, list] of Object.entries(by)) {
  console.log(`\n${k} (${list.length}):`)
  list.forEach((p) => console.log(`  - ${p.slug}`))
}
