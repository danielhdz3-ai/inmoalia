import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/** Recuperación de carrito (enlace mágico del email de abandonado). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || !/^[a-f0-9]{32,}$/i.test(token)) {
    return NextResponse.json({ error: 'Token no válido' }, { status: 400 })
  }

  try {
    const supabase = admin()
    const { data, error } = await supabase
      .from('abandoned_cart_snapshots')
      .select('cart, discarded_at')
      .eq('recovery_token', token)
      .maybeSingle()

    if (error || !data || data.discarded_at) {
      return NextResponse.json({ error: 'Enlace caducado o inválido' }, { status: 404 })
    }

    return NextResponse.json({ items: data.cart })
  } catch (err) {
    console.error('cart-reminder restore:', err)
    return NextResponse.json({ error: 'Error al recuperar' }, { status: 500 })
  }
}
