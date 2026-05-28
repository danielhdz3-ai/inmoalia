import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { COLLECTIONS } from '@/lib/content/collections'
import { BLOG_POSTS } from '@/lib/content/blog-posts'
import { getSiteUrl } from '@/lib/site'
import { isIndexableProduct } from '@/lib/seo/indexable-products'

const STATIC_PATHS: {
  path: string
  changeFreq: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}[] = [
    { path: '/', changeFreq: 'daily', priority: 1 },
    { path: '/productos', changeFreq: 'daily', priority: 0.9 },
    { path: '/categorias', changeFreq: 'weekly', priority: 0.85 },
    { path: '/contacto', changeFreq: 'monthly', priority: 0.55 },
    { path: '/envios', changeFreq: 'monthly', priority: 0.55 },
    { path: '/faq', changeFreq: 'monthly', priority: 0.55 },
    { path: '/devoluciones', changeFreq: 'monthly', priority: 0.55 },
    { path: '/terminos', changeFreq: 'yearly', priority: 0.35 },
    { path: '/privacidad', changeFreq: 'yearly', priority: 0.35 },
    { path: '/cookies', changeFreq: 'yearly', priority: 0.35 },
    { path: '/aviso-legal', changeFreq: 'yearly', priority: 0.35 },
    { path: '/sobre-nosotros', changeFreq: 'monthly', priority: 0.5 },
    { path: '/empleo', changeFreq: 'monthly', priority: 0.45 },
    { path: '/blog', changeFreq: 'weekly', priority: 0.65 },
    { path: '/colecciones', changeFreq: 'weekly', priority: 0.8 },
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

  const slugSet = new Set<string>(Object.keys(CATEGORY_META))

  try {
    const { data: dbCats } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)

    if (dbCats?.length) {
      for (const c of dbCats as { slug: string }[]) {
        if (c.slug in CATEGORY_META) slugSet.add(c.slug)
      }
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

  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${base}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.65,
    })
  }

  for (const slug of Object.keys(COLLECTIONS)) {
    entries.push({
      url: `${base}/colecciones/${encodeURIComponent(slug)}`,
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: now,
    })
  }

  let offset = 0
  try {
    for (;;) {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, tags')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      const list = products as { slug: string; updated_at: string | null; tags?: string[] | null }[] | null
      if (!list?.length) break

      for (const p of list) {
        if (!isIndexableProduct(p)) continue
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
