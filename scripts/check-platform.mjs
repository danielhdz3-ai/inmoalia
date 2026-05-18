import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar .env.local manualmente
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

async function checkPlatformStatus() {
  console.log('🔍 ANÁLISIS DE LA PLATAFORMA INMOALIA\n')
  console.log('=' .repeat(60))
  
  // 1. Productos
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  const { data: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true)
  
  console.log('\n📦 PRODUCTOS:')
  console.log(`   Total: ${products?.count || 0}`)
  console.log(`   Activos: ${activeProducts?.count || 0}`)
  console.log(`   Destacados: ${featuredProducts?.count || 0}`)
  
  // 2. Categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
  
  console.log('\n📂 CATEGORÍAS:')
  console.log(`   Total: ${categories?.count || 0}`)
  
  // 3. Pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
  
  console.log('\n🛒 PEDIDOS:')
  console.log(`   Total: ${orders?.count || 0}`)
  console.log(`   Pagados: ${paidOrders?.count || 0}`)
  
  // 4. Clientes
  const { data: customers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
  
  console.log('\n👥 CLIENTES:')
  console.log(`   Registrados: ${customers?.count || 0}`)
  
  // 5. Sync logs
  const { data: syncLogs } = await supabase
    .from('sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(5)
  
  console.log('\n🔄 SINCRONIZACIONES RECIENTES:')
  if (syncLogs && syncLogs.length > 0) {
    syncLogs.forEach(log => {
      console.log(`   ${log.supplier}: ${log.status} - ${log.products_synced} productos (${new Date(log.started_at).toLocaleDateString()})`)
    })
  } else {
    console.log('   ⚠️  Ninguna sincronización realizada')
  }
  
  // 6. Waitlist
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
  
  console.log('\n⏳ LISTA DE ESPERA:')
  console.log(`   Suscriptores: ${waitlist?.count || 0}`)
  
  console.log('\n' + '='.repeat(60))
  console.log('\n✅ ANÁLISIS COMPLETADO\n')
  
  // Resumen crítico
  console.log('⚠️  SITUACIONES CRÍTICAS:')
  const critical = []
  
  if (!activeProducts?.count || activeProducts.count === 0) {
    critical.push('   🔴 NO HAY PRODUCTOS ACTIVOS - La tienda no puede vender')
  }
  
  if (!categories?.count || categories.count === 0) {
    critical.push('   🟡 No hay categorías configuradas')
  }
  
  if (!syncLogs || syncLogs.length === 0) {
    critical.push('   🟡 No se han realizado sincronizaciones con proveedores')
  }
  
  if (critical.length === 0) {
    console.log('   ✅ No se detectaron problemas críticos')
  } else {
    critical.forEach(c => console.log(c))
  }
  
  console.log('')
}

checkPlatformStatus().catch(console.error)
