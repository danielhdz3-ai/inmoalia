import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendWelcomeAccountEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      fullName?: string
    }

    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const fullName = String(body.fullName ?? '').trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email', message: 'Email no válido.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'weak_password', message: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 },
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: 'server_config', message: 'Registro no disponible temporalmente. Inténtalo más tarde.' },
        { status: 503 },
      )
    }

    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (createError) {
      const msg = createError.message.toLowerCase()
      if (
        msg.includes('already') ||
        msg.includes('registered') ||
        msg.includes('exists') ||
        createError.status === 422
      ) {
        return NextResponse.json(
          {
            error: 'already_registered',
            message: 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.',
          },
          { status: 409 },
        )
      }
      console.error('[AUTH/register] createUser:', createError.message)
      return NextResponse.json(
        { error: 'create_failed', message: createError.message },
        { status: 400 },
      )
    }

    if (created.user) {
      const { error: customerError } = await admin.from('customers').upsert(
        { id: created.user.id, full_name: fullName || null },
        { onConflict: 'id' },
      )
      if (customerError) {
        console.error('[AUTH/register] customer upsert:', customerError.message)
      }
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      console.error('[AUTH/register] signIn after create:', signInError.message)
      return NextResponse.json({
        success: true,
        session: false,
        message: 'Cuenta creada. Inicia sesión con tu email y contraseña.',
      })
    }

    if (process.env.RESEND_API_KEY && created.user?.email) {
      try {
        const name = fullName || created.user.email.split('@')[0] || 'Cliente'
        const result = await sendWelcomeAccountEmail({ to: created.user.email, name })
        if (result.success) {
          await admin.auth.admin.updateUserById(created.user.id, {
            user_metadata: { full_name: fullName, welcome_email_sent: true },
          })
        }
      } catch (welcomeErr) {
        console.error('[AUTH/register] welcome email:', welcomeErr)
      }
    }

    return NextResponse.json({ success: true, session: true })
  } catch (err) {
    console.error('[AUTH/register] unexpected:', err)
    return NextResponse.json(
      { error: 'unexpected', message: 'Error al crear la cuenta. Inténtalo de nuevo.' },
      { status: 500 },
    )
  }
}
