import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import type { CartItem } from '@/store/cart'
import type { ShippingAddress, Product } from '@/lib/supabase/types'

export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress }: { items: CartItem[]; shippingAddress: ShippingAddress } =
      await req.json()

    if (!items?.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verificar stock actual de los productos
    const productIds = items.map((i) => i.id)
    const { data: rawProducts } = await supabase
      .from('products')
      .select('id, name, price, stock, supplier_sku, supplier')
      .in('id', productIds)
      .eq('is_active', true)

    const products = rawProducts as unknown as Pick<Product, 'id' | 'name' | 'price' | 'stock' | 'supplier_sku' | 'supplier'>[] | null

    if (!products || products.length !== items.length) {
      return NextResponse.json({ error: 'Algunos productos no están disponibles' }, { status: 400 })
    }

    // Validar stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        return NextResponse.json({ error: `Producto no encontrado: ${item.name}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para: ${product.name}` },
          { status: 400 }
        )
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingCost = subtotal >= 99 ? 0 : 5.99

    // Crear Stripe Checkout Session
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id)!
      return {
        product_id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: product.price,
        quantity: item.quantity,
        supplier_sku: product.supplier_sku,
        supplier: product.supplier,
      }
    })

    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Gastos de envío',
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/carrito`,
      customer_email: user?.email ?? shippingAddress.email,
      metadata: {
        customer_id: user?.id ?? '',
        items: JSON.stringify(orderItems),
        shipping_address: JSON.stringify(shippingAddress),
      },
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'DE', 'IT', 'NL', 'BE'],
      },
      locale: 'es',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Error al crear la sesión de pago' }, { status: 500 })
  }
}
