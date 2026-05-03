import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendWelcomeAccountEmail } from '@/lib/resend/emails'

/**
 * Callback PKCE de Supabase Auth.
 * Se llama tras verificar email de confirmación o reset de contraseña.
 * Intercambia el código por una sesión y redirige al destino.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  if (error) {
    console.error('Auth callback error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/login?error=link_expired`)
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser()
      const recoveryFlow = typeof next === 'string' && next.includes('nueva-password')

      if (
        user?.email &&
        !recoveryFlow &&
        user.user_metadata?.welcome_email_sent !== true &&
        process.env.RESEND_API_KEY
      ) {
        try {
          const meta = user.user_metadata ?? {}
          const name =
            typeof meta.full_name === 'string' && meta.full_name.trim()
              ? meta.full_name.trim()
              : user.email.split('@')[0] ?? 'Cliente'
          await sendWelcomeAccountEmail({ to: user.email, name })

          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          if (serviceKey) {
            const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            })
            await admin.auth.admin.updateUserById(user.id, {
              user_metadata: { ...meta, welcome_email_sent: true },
            })
          }
        } catch (welcomeErr) {
          console.error('Welcome email (Resend):', welcomeErr)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Code exchange error:', exchangeError)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
