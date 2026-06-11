import { createClient } from '@supabase/supabase-js'
import { sendNewSaleAdminAlert } from '../lib/resend/emails'
import type { Order } from '../lib/supabase/types'

async function main() {
  const orderNumber = process.argv[2]
  if (!orderNumber) {
    console.error('Uso: npx tsx scripts/notify-admin-sale-runner.ts INM-2026-611979')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  if (error || !order) {
    console.error('Pedido no encontrado:', orderNumber, error?.message)
    process.exit(1)
  }

  const result = await sendNewSaleAdminAlert(order as unknown as Order)
  if (!result.success) {
    console.error('❌ No enviado:', result.error)
    process.exit(1)
  }
  console.log('✅ Aviso de venta enviado para', orderNumber)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
