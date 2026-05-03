import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, product_id } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('waitlist')
      .insert({ email, product_id: product_id ?? null })

    if (error) {
      // Unique constraint: ya suscrito
      if (error.code === '23505') {
        return NextResponse.json({ success: true, already: true })
      }
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Error al apuntarte a la lista' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
