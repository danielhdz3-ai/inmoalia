import { createClient } from '@supabase/supabase-js'
import {
  sendOrderStatusEmail,
  sendShippingNotification,
  sendManualOrderCustomerEmail,
} from '../lib/resend/emails'
import { isResendConfigured } from '../lib/resend/config'
import type { Order } from '../lib/supabase/types'

async function main() {
  const orderNumber = process.argv[2] ?? 'INM-20260520-6526'
  const status = (process.argv[3] ?? 'paid') as Order['status']
  const tracking = process.argv[4]?.trim() || undefined

  if (!isResendConfigured()) {
    console.error('RESEND_API_KEY no configurada en el entorno')
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

  const typed = order as unknown as Order
  const testOrder: Order = { ...typed, status }

  if (status === 'shipped') {
    await sendShippingNotification(testOrder, tracking ?? typed.tracking_number ?? 'TEST-TRACKING')
    console.log('✅ Email de envío enviado a', typed.customer_email)
    return
  }

  await sendOrderStatusEmail(testOrder, status)
  console.log(`✅ Email de estado "${status}" enviado a`, typed.customer_email)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
