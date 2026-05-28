import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { isActiveProductSlug, isLegacyTestProductSlug, searchHasActiveProducts } from '@/lib/shop/product-slug-guard'
import { productNotFoundResponse } from '@/lib/shop/not-found-response'

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

  const productMatch = pathname.match(/^\/productos\/([^/]+)$/)
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1])
    if (isLegacyTestProductSlug(slug)) {
      return productNotFoundResponse()
    }
    const exists = await isActiveProductSlug(slug)
    if (exists === false) {
      return productNotFoundResponse()
    }
  }

  // Consolidar /productos?categoria=X → /categorias/X (evita contenido duplicado)
  if (pathname === '/productos') {
    const q = request.nextUrl.searchParams.get('q')?.trim()
    if (q) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/buscar'
      dest.search = ''
      dest.searchParams.set('q', q)
      return NextResponse.redirect(dest, 301)
    }

    const categoria = request.nextUrl.searchParams.get('categoria')?.trim()
    if (categoria && CATEGORY_META[categoria]) {
      const dest = request.nextUrl.clone()
      dest.pathname = `/categorias/${categoria}`
      dest.searchParams.delete('categoria')
      return NextResponse.redirect(dest, 301)
    }
  }

  if (pathname === '/buscar') {
    const q = request.nextUrl.searchParams.get('q')?.trim()
    if (q && q.length >= 2) {
      const hasResults = await searchHasActiveProducts(q)
      if (hasResults === false) {
        return productNotFoundResponse()
      }
    }
  }

  const legacyCategoryRedirects: Record<string, string> = {
    estanterias: '/categorias/salon',
    decoracion: '/categorias/hogar',
    outlet: '/categorias/ofertas',
  }
  if (pathname.startsWith('/categorias/')) {
    const slug = pathname.slice('/categorias/'.length).split('/')[0]
    const target = legacyCategoryRedirects[slug]
    if (target) {
      const suffix = pathname.slice(`/categorias/${slug}`.length)
      return NextResponse.redirect(new URL(`${target}${suffix}${request.nextUrl.search}`, request.url), 301)
    }

    // Quitar ?categoria= duplicado (legacy: /categorias/jardin?categoria=jardin&...)
    if (request.nextUrl.searchParams.has('categoria')) {
      const dest = request.nextUrl.clone()
      dest.searchParams.delete('categoria')
      return NextResponse.redirect(dest, 301)
    }
  }

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
