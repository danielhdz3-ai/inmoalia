import type { Order, OrderItem } from '@/lib/supabase/types'

const DROPPERY_API = 'https://api.droppery.io/v1'

interface DropperyProduct {
  id: string
  sku: string
  name: string
  description: string
  retail_price: number
  wholesale_price: number
  images: string[]
  category: string
  tags: string[]
  stock_quantity: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  material: string
  color: string
}

interface DropperyOrderResponse {
  order_id: string
  external_reference: string
  status: string
}

export async function syncDropperyProducts(): Promise<DropperyProduct[]> {
  const response = await fetch(`${DROPPERY_API}/products?category=home-living&limit=200`, {
    headers: {
      Authorization: `Bearer ${process.env.DROPPERY_API_KEY}`,
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Droppery sync failed: ${response.status}`)
  }

  return response.json()
}

export async function createDropperyOrder(order: Order): Promise<DropperyOrderResponse> {
  const items = order.items as unknown as OrderItem[]

  const response = await fetch(`${DROPPERY_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DROPPERY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_reference: order.order_number,
      delivery_address: order.shipping_address,
      lines: items.map((i) => ({
        sku: i.supplier_sku,
        quantity: i.quantity,
        unit_price: i.price,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Droppery order failed: ${response.status} — ${error}`)
  }

  return response.json()
}
