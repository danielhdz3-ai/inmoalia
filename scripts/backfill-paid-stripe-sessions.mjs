/**
 * Recupera pedidos pagados en Stripe que no están en Supabase.
 * Uso: node --env-file=.env.local scripts/backfill-paid-stripe-sessions.mjs
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function generateOrderNumber() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const r = Math.floor(Math.random() * 9000 + 1000)
  return `INM-${y}${m}${day}-${r}`
}

async function sendConfirmation(order) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('   RESEND_API_KEY ausente, email omitido')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL || 'info@inmoalia.com'
  const items = order.items ?? []
  const lines = items
    .map((i) => `<li>${i.name} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} €</li>`)
    .join('')

  await resend.emails.send({
    from: `INMOALIA <${from}>`,
    to: order.customer_email,
    subject: `Pedido confirmado ${order.order_number} — INMOALIA`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Pedido <strong>${order.order_number}</strong></p>
      <ul>${lines}</ul>
      <p><strong>Total: ${Number(order.total).toFixed(2)} €</strong></p>
      <p>INMOALIA — Hogar & Jardín</p>
    `,
  })
}

async function fulfillSession(session) {
  if (session.payment_status !== 'paid') return null

  const { data: existing } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existing) return { order: existing, created: false }

  const items = JSON.parse(session.metadata?.items ?? '[]')
  if (!items.length) return null

  const metadataAddress = JSON.parse(session.metadata?.shipping_address ?? '{}')
  const customerEmail = (
    session.customer_email ??
    session.customer_details?.email ??
    metadataAddress.email ??
    ''
  ).trim()

  let customerId = session.metadata?.customer_id?.trim() || null
  if (!customerId && customerEmail) {
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    customerId =
      data?.users?.find((u) => u.email?.toLowerCase() === customerEmail.toLowerCase())?.id ?? null
  }

  const subtotal = (session.amount_subtotal ?? 0) / 100
  const total = (session.amount_total ?? 0) / 100

  const insertData = {
    order_number: generateOrderNumber(),
    customer_id: customerId,
    customer_email: customerEmail,
    status: 'paid',
    stripe_session_id: session.id,
    stripe_payment_id:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    items,
    shipping_address: metadataAddress,
    subtotal,
    shipping_cost: Math.max(0, total - subtotal),
    total,
  }

  const { data: order, error } = await supabase.from('orders').insert(insertData).select().single()
  if (error || !order) {
    console.error('   insert error:', error?.message)
    return null
  }

  try {
    await sendConfirmation(order)
    console.log('   📧 email enviado a', customerEmail)
  } catch (e) {
    console.error('   email error:', e.message)
  }

  return { order, created: true }
}

const sessions = await stripe.checkout.sessions.list({ limit: 20, status: 'complete' })
let created = 0

for (const summary of sessions.data) {
  const session = await stripe.checkout.sessions.retrieve(summary.id)
  const result = await fulfillSession(session)
  if (!result) {
    console.log('❌', session.id)
    continue
  }
  if (result.created) {
    created++
    console.log('✅', result.order.order_number, session.customer_email)
  } else {
    console.log('⏭️ ', result.order.order_number)
  }
}

console.log(`\nPedidos nuevos: ${created}`)
