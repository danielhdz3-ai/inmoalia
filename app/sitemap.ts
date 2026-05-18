import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { getSiteUrl } from '@/lib/site'

const STATIC_PATHS: {
  path: string
  changeFreq: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}[] = [
    { path: '/', changeFreq: 'daily', priority: 1 },
    { path: '/productos', changeFreq: 'daily', priority: 0.9 },
    { path: '/categorias', changeFreq: 'weekly', priority: 0.85 },
    { path: '/buscar', changeFreq: 'weekly', priority: 0.5 },
    { path: '/contacto', changeFreq: 'monthly', priority: 0.55 },
    { path: '/faq', changeFreq: 'monthly', priority: 0.55 },
    { path: '/devoluciones', changeFreq: 'monthly', priority: 0.55 },
    { path: '/terminos', changeFreq: 'yearly', priority: 0.35 },
    { path: '/privacidad', changeFreq: 'yearly', priority: 0.35 },
    { path: '/cookies', changeFreq: 'yearly', priority: 0.35 },
    { path: '/aviso-legal', changeFreq: 'yearly', priority: 0.35 },
    { path: '/sobre-nosotros', changeFreq: 'monthly', priority: 0.5 },
    { path: '/empleo', changeFreq: 'monthly', priority: 0.45 },
    { path: '/blog', changeFreq: 'weekly', priority: 0.6 },
  ]

const PAGE_SIZE = 800

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFreq, priority }) => ({
    url: path === '/' ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }))

  const supabase = await createClient()

  const slugSet = new Set<string>()
  Object.keys(CATEGORY_META).forEach((s) => slugSet.add(s))

  try {
    const { data: dbCats } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (dbCats?.length) {
      for (const c of dbCats as { slug: string; updated_at?: string | null }[]) slugSet.add(c.slug)
    }
  } catch {
    /* sin categorías */
  }

  for (const slug of slugSet) {
    entries.push({
      url: `${base}/categorias/${encodeURIComponent(slug)}`,
      changeFrequency: 'weekly',
      priority: 0.85,
      lastModified: now,
    })
  }

  let offset = 0
  try {
    for (;;) {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      const list = products as { slug: string; updated_at: string | null }[] | null
      if (!list?.length) break

      for (const p of list) {
        entries.push({
          url: `${base}/productos/${encodeURIComponent(p.slug)}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }

      if (list.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }
  } catch {
    /* catálogo vacío */
  }

  return entries
}
