import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Guarda una copia del carrito tras consentimiento explícito (marketing / recordatorio). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email?: string
      cart?: unknown
      consentReminder?: boolean
    }

    if (!body.consentReminder) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
    }

    const cart = body.cart
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const token = randomBytes(24).toString('hex')
    const now = new Date().toISOString()

    const supabase = admin()
    const { data: existing } = await supabase
      .from('abandoned_cart_snapshots')
      .select('id')
      .eq('email', email)
      .is('discarded_at', null)
      .maybeSingle()

    const row = { cart, recovery_token: token, last_activity_at: now }

    if (existing && typeof existing === 'object' && 'id' in existing) {
      const { error } = await supabase
        .from('abandoned_cart_snapshots')
        .update(row as never)
        .eq('id', (existing as { id: string }).id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('abandoned_cart_snapshots').insert({
        email,
        cart,
        recovery_token: token,
        consent_reminder: true,
        last_activity_at: now,
      } as never)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('cart-reminder snapshot:', err)
    return NextResponse.json({ error: 'No se pudo guardar la preferencia' }, { status: 500 })
  }
}
