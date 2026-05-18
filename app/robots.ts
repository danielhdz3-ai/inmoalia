import type { MetadataRoute } from 'next'
import { getSiteUrl, shouldBlockIndexing } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  const hostname = new URL(base).hostname

  if (shouldBlockIndexing()) {
    return {
      rules: { userAgent: '*', disallow: ['/'] },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/cuenta/', '/login', '/recuperar-password', '/registro'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: hostname,
  }
}
