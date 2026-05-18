import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { CartItem } from '@/store/cart'
import type { ShippingAddress, Product } from '@/lib/supabase/types'
import { getShippingCostEuros } from '@/lib/shop/shipping'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress, couponCode }: {
      items: CartItem[]
      shippingAddress: ShippingAddress
      couponCode?: string | null
    } = await req.json()

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

    // Validar cupón server-side (second check — nunca confiar solo en el cliente)
    let discountAmount = 0
    let validatedCouponCode: string | null = null

    if (couponCode) {
      const adminClient = getAdminClient()
      const { data: coupon } = await adminClient
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (
        coupon &&
        (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()) &&
        (coupon.max_uses === null || coupon.uses_count < coupon.max_uses) &&
        subtotal >= (coupon.min_order ?? 0)
      ) {
        discountAmount = coupon.discount_type === 'percentage'
          ? subtotal * coupon.discount_value / 100
          : Math.min(coupon.discount_value, subtotal)
        validatedCouponCode = coupon.code

        // Incrementar contador de usos
        await adminClient
          .from('coupons')
          .update({ uses_count: coupon.uses_count + 1 } as never)
          .eq('id', coupon.id)
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount)
    const shippingCost = getShippingCostEuros(discountedSubtotal)

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

    // Línea de descuento en Stripe (si aplica)
    // Stripe no soporta line items negativos: usamos un cupón dinámico de Stripe
    const stripeDiscounts: { coupon: string }[] = []
    if (discountAmount > 0 && validatedCouponCode) {
      try {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: 'eur',
          duration: 'once',
          name: `Cupón ${validatedCouponCode}`,
        })
        stripeDiscounts.push({ coupon: stripeCoupon.id })
      } catch {
        // Si falla crear el cupón de Stripe, continuamos sin descuento en Stripe
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Bizum en Stripe (ES); el tipo del SDK no lista 'bizum' aún
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_types: ['card', 'bizum'] as any,
      line_items: lineItems,
      ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/carrito`,
      customer_email: user?.email ?? shippingAddress.email,
      metadata: {
        customer_id: user?.id ?? '',
        items: JSON.stringify(orderItems),
        shipping_address: JSON.stringify(shippingAddress),
        coupon_code: validatedCouponCode ?? '',
        discount_amount: String(discountAmount),
      },
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'DE', 'IT', 'NL', 'BE'],
      },
      locale: 'es',
    })

    const emailNorm = (shippingAddress.email ?? user?.email ?? '').trim().toLowerCase()
    if (emailNorm) {
      try {
        await getAdminClient()
          .from('abandoned_cart_snapshots')
          .update({ discarded_at: new Date().toISOString() } as never)
          .eq('email', emailNorm)
          .is('discarded_at', null)
      } catch {
        // Migración opcional: ignorar si la tabla no existe aún
      }
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Error al crear la sesión de pago' }, { status: 500 })
  }
}
