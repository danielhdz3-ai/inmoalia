import Stripe from 'stripe'
import { stripe } from './client'

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export function isPaymentSucceeded(event: Stripe.Event): boolean {
  return event.type === 'checkout.session.completed'
}

export function extractSessionData(event: Stripe.Event): Stripe.Checkout.Session | null {
  if (event.type !== 'checkout.session.completed') return null
  return event.data.object as Stripe.Checkout.Session
}

/** ID del PaymentIntent asociado al cargo (Stripe expande a veces el objeto). */
export function paymentIntentIdFromCharge(charge: Stripe.Charge): string | null {
  const pi = charge.payment_intent
  if (!pi) return null
  return typeof pi === 'string' ? pi : pi.id
}
