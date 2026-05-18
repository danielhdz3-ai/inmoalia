import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Evita que middleware reviente si faltan vars o siguen siendo el ejemplo del .env.
 */
function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  if (!url || !anonKey) return null
  if (url.includes('<') || url.includes('>')) return null
  if (/\/tu-proyecto\//i.test(url) || url.includes('tu-proyecto')) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return { url, anonKey }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const creds = getSupabaseEnv()

  let user: User | null = null

  if (creds) {
    const supabase = createServerClient(creds.url, creds.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    user = sessionUser ?? null
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[INMOALIA] Supabase: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no válidos o ausentes. Copia .env.local.example a .env.local y pega la URL y anon key del proyecto Supabase.',
    )
  }

  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      console.log('[MIDDLEWARE] Admin route without user, redirecting to login:', pathname)
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? '')) {
      console.log('[MIDDLEWARE] Non-admin user trying to access admin:', user.email)
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('[MIDDLEWARE] Admin access granted:', user.email, pathname)
  }

  // Protect /cuenta and /pedidos routes
  // /cuenta/nueva-password is exempt: the user arrives from the email link
  // and the auth callback (/api/auth/callback) sets the session just before redirecting here.
  const isNewPassword = pathname === '/cuenta/nueva-password'
  if (!isNewPassword && (pathname.startsWith('/cuenta') || pathname.startsWith('/pedidos'))) {
    if (!user) {
      console.log('[MIDDLEWARE] Protected route without user, redirecting to login:', pathname)
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    console.log('[MIDDLEWARE] Account access granted:', user.email, pathname)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
