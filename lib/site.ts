import type { Metadata } from 'next'

/** URL canónica del sitio (sin barra final). */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && !configured.includes('undefined')) {
    try {
      const parsed = new URL(configured)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return configured.replace(/\/$/, '')
      }
    } catch {
      // URL mal formada en env → usar fallback
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  }
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://www.inmoalia.com'
  }
  return 'http://localhost:3000'
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl()
  if (!pathname || pathname === '/') return `${base}/`
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${p}`
}

/** Staging / previews: no indexar. Activa con `NEXT_PUBLIC_SITE_NOINDEX=true` o `VERCEL_ENV=preview`. */
export function shouldBlockIndexing(): boolean {
  const flag = process.env.NEXT_PUBLIC_SITE_NOINDEX?.trim().toLowerCase()
  if (flag === '1' || flag === 'true' || flag === 'yes') return true
  if (process.env.VERCEL_ENV === 'preview') return true
  return false
}

export function indexingRobotsMetadata(): Metadata['robots'] {
  if (!shouldBlockIndexing()) {
    return { index: true, follow: true, googleBot: { index: true, follow: true } }
  }
  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  }
}
