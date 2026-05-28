import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  constructWebhookEvent,
  extractSessionData,
  paymentIntentIdFromCharge,
} from '@/lib/stripe/webhooks'
import { fulfillOrderFromStripeSession } from '@/lib/stripe/fulfill-order'
import { stripe } from '@/lib/stripe/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendOrderRefundNotice } from '@/lib/resend/emails'
import type { Order } from '@/lib/supabase/types'

export const runtime = 'nodejs'

function getSupabaseService() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge
  const pi = paymentIntentIdFromCharge(charge)
  if (!pi) {
    return NextResponse.json({ received: true })
  }

  const supabase = getSupabaseService()
  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_id', pi)
    .maybeSingle()

  if (!orderRow) {
    return NextResponse.json({ received: true })
  }

  const order = orderRow as unknown as Order
  const refundedEUR = (charge.amount_refunded ?? 0) / 100
  const isFull =
    typeof charge.amount === 'number' &&
    charge.amount > 0 &&
    (charge.amount_refunded ?? 0) >= charge.amount

  try {
    await sendOrderRefundNotice(order, refundedEUR, isFull)
  } catch (err) {
    console.error('Error sending refund notice email:', err)
  }

  return NextResponse.json({ received: true })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'charge.refunded') {
    return handleChargeRefunded(event)
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = extractSessionData(event)
  if (!session) {
    return NextResponse.json({ error: 'No session data' }, { status: 400 })
  }

  try {
    const fullSession = await stripe.checkout.sessions.retrieve(session.id)
    const result = await fulfillOrderFromStripeSession(fullSession)

    if (result.status === 'fulfilled') {
      return NextResponse.json({
        success: true,
        orderId: result.order.id,
        created: result.created,
      })
    }

    if (result.status === 'skipped') {
      console.warn('[webhook] skipped:', result.reason, session.id)
      return NextResponse.json({ received: true, skipped: result.reason })
    }

    console.error('[webhook] fulfill error:', result.reason, session.id)
    return NextResponse.json({ error: result.reason }, { status: 500 })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
