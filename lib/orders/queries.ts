import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Order } from '@/lib/supabase/types'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** Pedidos del usuario por customer_id o email (service role, uso solo en servidor). */
export async function getOrdersForUser(user: { id: string; email?: string | null }): Promise<Order[]> {
  const admin = getAdminClient()
  const email = (user.email ?? '').trim().toLowerCase()

  const { data: byId } = await admin
    .from('orders')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  let orders = (byId as unknown as Order[]) ?? []

  if (email) {
    const { data: byEmail } = await admin
      .from('orders')
      .select('*')
      .ilike('customer_email', email)
      .order('created_at', { ascending: false })

    const seen = new Set(orders.map((o) => o.id))
    for (const row of (byEmail as unknown as Order[]) ?? []) {
      if (!seen.has(row.id)) {
        orders.push(row)
        seen.add(row.id)
      }
    }
    orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  return orders
}

export async function getOrderForUser(
  orderId: string,
  user: { id: string; email?: string | null },
): Promise<Order | null> {
  const admin = getAdminClient()
  const { data } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (!data) return null

  const order = data as unknown as Order
  const email = (user.email ?? '').trim().toLowerCase()
  const owns =
    order.customer_id === user.id ||
    (!!email && order.customer_email?.trim().toLowerCase() === email)

  return owns ? order : null
}
