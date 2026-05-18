import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Leer .env.local manualmente
const envContent = readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, images')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('\n📦 PRODUCTOS EN BASE DE DATOS:\n')
  console.log(JSON.stringify(data, null, 2))
}

checkProducts()
