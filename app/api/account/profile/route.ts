import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { message: 'Servicio no disponible temporalmente.' },
        { status: 503 },
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Debes iniciar sesión.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      fullName?: string
      phone?: string
      address?: Record<string, unknown>
    }

    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await admin.from('customers').upsert(
      {
        id: user.id,
        full_name: String(body.fullName ?? '').trim() || null,
        phone: String(body.phone ?? '').trim() || null,
        address: body.address ?? null,
      },
      { onConflict: 'id' },
    )

    if (error) {
      console.error('[API/account/profile]', error.message)
      return NextResponse.json(
        { message: 'No se pudieron guardar los cambios. Inténtalo de nuevo.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API/account/profile] unexpected:', err)
    return NextResponse.json(
      { message: 'Error inesperado al guardar.' },
      { status: 500 },
    )
  }
}
