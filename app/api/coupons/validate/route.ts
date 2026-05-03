import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Introduce un código de cupón' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (!coupon) {
      return NextResponse.json({ error: 'Código de cupón no válido' }, { status: 404 })
    }

    // Verificar expiración
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este cupón ha caducado' }, { status: 400 })
    }

    // Verificar máximo de usos
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Este cupón ya no está disponible' }, { status: 400 })
    }

    // Verificar pedido mínimo
    if (subtotal !== undefined && coupon.min_order > 0 && subtotal < coupon.min_order) {
      return NextResponse.json(
        { error: `Pedido mínimo de ${coupon.min_order}€ para usar este cupón` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al validar el cupón' }, { status: 500 })
  }
}
