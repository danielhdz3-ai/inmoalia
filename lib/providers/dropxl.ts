import type { Order, OrderItem } from '@/lib/supabase/types'

const DROPXL_API = 'https://api.dropxl.com/v1'

interface DropXLOrderResponse {
  id: string
  reference: string
  status: string
  created_at: string
}

interface DropXLProduct {
  sku: string
  name: string
  description: string
  price: number
  cost_price: number
  images: string[]
  category: string
  stock: number
  weight_kg: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
  material: string
}

export async function createDropXLOrder(order: Order): Promise<DropXLOrderResponse> {
  const items = order.items as unknown as OrderItem[]

  const response = await fetch(`${DROPXL_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DROPXL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference: order.order_number,
      shipping_address: order.shipping_address,
      items: items.map((i) => ({
        sku: i.supplier_sku,
        quantity: i.quantity,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DropXL order failed: ${response.status} — ${error}`)
  }

  return response.json()
}

export async function syncDropXLProducts(): Promise<DropXLProduct[]> {
  const response = await fetch(`${DROPXL_API}/products?category=home-garden&limit=500`, {
    headers: {
      Authorization: `Bearer ${process.env.DROPXL_API_KEY}`,
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`DropXL sync failed: ${response.status}`)
  }

  return response.json()
}

export async function getDropXLStock(skus: string[]): Promise<Record<string, number>> {
  const response = await fetch(`${DROPXL_API}/stock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DROPXL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skus }),
  })

  if (!response.ok) {
    throw new Error(`DropXL stock check failed: ${response.status}`)
  }

  return response.json()
}
