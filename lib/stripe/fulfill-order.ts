import type Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendOrderConfirmation, sendNewSaleAdminAlert } from '@/lib/resend/emails'
import { createDropXLOrder } from '@/lib/providers/dropxl'
import { createDropperyOrder } from '@/lib/providers/droppery'
import { generateOrderNumber } from '@/lib/utils'
import type { Order, OrderItem, ShippingAddress } from '@/lib/supabase/types'

function getSupabaseService() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw?.trim()) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent
  if (!pi) return null
  return typeof pi === 'string' ? pi : pi.id
}

function shippingAddressFromSession(
  session: Stripe.Checkout.Session,
  metadataAddress: ShippingAddress,
): ShippingAddress {
  const sessionAny = session as Stripe.Checkout.Session & {
    shipping_details?: {
      name?: string | null
      address?: Stripe.Address | null
    }
  }
  const stripeAddr =
    sessionAny.shipping_details?.address ?? session.customer_details?.address
  const stripeName =
    sessionAny.shipping_details?.name ??
    session.customer_details?.name ??
    metadataAddress.full_name
  const stripePhone = session.customer_details?.phone ?? metadataAddress.phone

  if (!stripeAddr) {
    return metadataAddress
  }

  return {
    full_name: stripeName || metadataAddress.full_name || '',
    email: session.customer_email ?? session.customer_details?.email ?? metadataAddress.email,
    phone: stripePhone || metadataAddress.phone || '',
    address_line1: stripeAddr.line1 || metadataAddress.address_line1 || '',
    address_line2: stripeAddr.line2 ?? metadataAddress.address_line2,
    city: stripeAddr.city || metadataAddress.city || '',
    postal_code: stripeAddr.postal_code || metadataAddress.postal_code || '',
    province: stripeAddr.state || metadataAddress.province || '',
    country: stripeAddr.country || metadataAddress.country || 'España',
  }
}

async function resolveCustomerId(
  metadataCustomerId: string | null,
  customerEmail: string,
): Promise<string | null> {
  if (metadataCustomerId && metadataCustomerId.length >= 32) {
    return metadataCustomerId
  }
  if (!customerEmail) return null

  const supabase = getSupabaseService()
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const match = data?.users?.find(
    (u) => u.email?.toLowerCase() === customerEmail.toLowerCase(),
  )
  return match?.id ?? null
}

async function decrementStock(items: OrderItem[]) {
  const supabase = getSupabaseService()
  const productIds = items.map((i) => i.product_id)
  const { data: currentProducts } = await supabase
    .from('products')
    .select('id, stock')
    .in('id', productIds)

  if (!currentProducts) return

  await Promise.all(
    items.map((item) => {
      const current = (currentProducts as { id: string; stock: number }[]).find(
        (p) => p.id === item.product_id,
      )
      if (!current) return Promise.resolve()
      const newStock = Math.max(0, current.stock - item.quantity)
      return supabase
        .from('products')
        .update({ stock: newStock } as never)
        .eq('id', item.product_id)
    }),
  )
}

async function placeSupplierOrders(order: Order, items: OrderItem[]) {
  const supabase = getSupabaseService()
  const suppliers = [...new Set(items.map((i) => i.supplier).filter(Boolean))]

  for (const supplier of suppliers) {
    try {
      let supplierOrderId: string | undefined

      if (supplier === 'dropxl') {
        supplierOrderId = (await createDropXLOrder(order)).id
      } else if (supplier === 'droppery') {
        supplierOrderId = (await createDropperyOrder(order)).order_id
      }

      if (supplierOrderId) {
        await supabase
          .from('orders')
          .update({ supplier_order_id: supplierOrderId, status: 'processing' } as never)
          .eq('id', order.id)
      }
    } catch (err) {
      console.error(`[fulfill-order] supplier ${supplier}:`, err)
    }
  }
}

export type FulfillOrderResult = {
  order: Order
  created: boolean
}

export type FulfillOrderOutcome =
  | { status: 'fulfilled'; order: Order; created: boolean }
  | { status: 'skipped'; reason: 'unpaid' | 'no_items' | 'not_our_session' }
  | { status: 'error'; reason: string }

/** Crea el pedido en Supabase (idempotente por stripe_session_id) y envía email si es nuevo. */
export async function fulfillOrderFromStripeSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillOrderOutcome> {
  if (session.payment_status !== 'paid') {
    return { status: 'skipped', reason: 'unpaid' }
  }

  const supabase = getSupabaseService()

  const { data: existing } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existing) {
    return { status: 'fulfilled', order: existing as unknown as Order, created: false }
  }

  const items = parseJson<OrderItem[]>(session.metadata?.items, [])
  if (!items.length) {
    console.error('[fulfill-order] session sin items en metadata:', session.id)
    return { status: 'skipped', reason: 'no_items' }
  }

  const metadataAddress = parseJson<ShippingAddress>(session.metadata?.shipping_address, {
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    postal_code: '',
    province: '',
    country: 'España',
  })

  const customerEmail = (
    session.customer_email ??
    session.customer_details?.email ??
    metadataAddress.email ??
    ''
  ).trim()

  const customerId = await resolveCustomerId(
    session.metadata?.customer_id?.trim() || null,
    customerEmail,
  )

  const shippingAddress = shippingAddressFromSession(session, {
    ...metadataAddress,
    email: customerEmail || metadataAddress.email,
  })

  const subtotal = (session.amount_subtotal ?? 0) / 100
  const total = (session.amount_total ?? 0) / 100
  const shippingCost = Math.max(0, total - subtotal)

  const insertData = {
    order_number: generateOrderNumber(),
    customer_id: customerId,
    customer_email: customerEmail,
    status: 'paid' as const,
    stripe_session_id: session.id,
    stripe_payment_id: paymentIntentId(session),
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
    if (orderError?.code === '23505') {
      const { data: raced } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session.id)
        .maybeSingle()
      if (raced) return { status: 'fulfilled', order: raced as unknown as Order, created: false }
    }
    console.error('[fulfill-order] insert error:', orderError)
    return { status: 'error', reason: orderError?.message ?? 'insert_failed' }
  }

  const typedOrder = order as unknown as Order

  try {
    await decrementStock(items)
  } catch (err) {
    console.error('[fulfill-order] stock:', err)
  }

  try {
    await placeSupplierOrders(typedOrder, items)
  } catch (err) {
    console.error('[fulfill-order] suppliers:', err)
  }

  try {
    await sendOrderConfirmation(typedOrder)
  } catch (err) {
    console.error('[fulfill-order] confirmation email:', err)
  }

  try {
    await sendNewSaleAdminAlert(typedOrder)
  } catch (err) {
    console.error('[fulfill-order] admin sale alert:', err)
  }

  return { status: 'fulfilled', order: typedOrder, created: true }
}
