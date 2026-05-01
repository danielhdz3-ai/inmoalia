import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, extractSessionData } from '@/lib/stripe/webhooks'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendOrderConfirmation } from '@/lib/resend/emails'
import { createDropXLOrder } from '@/lib/providers/dropxl'
import { createDropperyOrder } from '@/lib/providers/droppery'
import { generateOrderNumber } from '@/lib/utils'
import type { OrderItem, ShippingAddress, Order } from '@/lib/supabase/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = await constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = extractSessionData(event)
  if (!session) {
    return NextResponse.json({ error: 'No session data' }, { status: 400 })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Parsear items del metadata
    const items: OrderItem[] = JSON.parse(session.metadata?.items ?? '[]')
    const shippingAddress: ShippingAddress = JSON.parse(session.metadata?.shipping_address ?? '{}')
    const customerId = session.metadata?.customer_id ?? null
    const customerEmail = session.customer_email ?? ''
    const subtotal = (session.amount_subtotal ?? 0) / 100
    const total = (session.amount_total ?? 0) / 100
    const shippingCost = total - subtotal

    // Crear el pedido en Supabase
    const insertData = {
      order_number: generateOrderNumber(),
      customer_id: customerId,
      customer_email: customerEmail,
      status: 'paid' as const,
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent as string,
      items: items as unknown as Order['items'],
      shipping_address: shippingAddress as unknown as Order['shipping_address'],
      subtotal,
      shipping_cost: shippingCost,
      total,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(insertData as never)
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Crear pedido en el proveedor según supplier
    const suppliers = [...new Set(items.map((i) => i.supplier).filter(Boolean))]

    for (const supplier of suppliers) {
      try {
        let supplierOrderId: string | undefined

        if (supplier === 'dropxl') {
          const dropxlOrder = await createDropXLOrder(order)
          supplierOrderId = dropxlOrder.id
        } else if (supplier === 'droppery') {
          const dropperyOrder = await createDropperyOrder(order)
          supplierOrderId = dropperyOrder.order_id
        }

        if (supplierOrderId) {
          await supabase
            .from('orders')
            .update({ supplier_order_id: supplierOrderId, status: 'processing' } as never)
            .eq('id', (order as unknown as Order).id)
        }
      } catch (err) {
        console.error(`Error placing order with ${supplier}:`, err)
        // No fallar el webhook por un error del proveedor — se reintentará manualmente
      }
    }

    // Enviar email de confirmación
    try {
      await sendOrderConfirmation(order as unknown as Order)
    } catch (err) {
      console.error('Error sending confirmation email:', err)
    }

    return NextResponse.json({ success: true, orderId: (order as unknown as Order).id })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
