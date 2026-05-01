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
