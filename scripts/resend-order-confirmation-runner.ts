import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmation } from '../lib/resend/emails'
import type { Order } from '../lib/supabase/types'

async function main() {
  const orderNumber = process.argv[2] ?? 'INM-20260520-6626'

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

  await sendOrderConfirmation(order as unknown as Order)
  console.log('✅ Email reenviado a', order.customer_email)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
