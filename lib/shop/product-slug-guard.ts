const NON_INDEXABLE_SLUG_RE = /^(producto-test-|inmoalia-prueba-)/

function getSupabaseRestEnv(): { url: string; anonKey: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  if (!url || !anonKey || url.includes('<') || url.includes('tu-proyecto')) return null
  return { url, anonKey }
}

/** Comprueba en Supabase si el slug corresponde a un producto activo (sin cookies). */
export async function isActiveProductSlug(slug: string): Promise<boolean | null> {
  const creds = getSupabaseRestEnv()
  if (!creds) return null

  const endpoint = new URL(`${creds.url}/rest/v1/products`)
  endpoint.searchParams.set('select', 'slug')
  endpoint.searchParams.set('slug', `eq.${slug}`)
  endpoint.searchParams.set('is_active', 'eq.true')
  endpoint.searchParams.set('limit', '1')

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: creds.anonKey,
        Authorization: `Bearer ${creds.anonKey}`,
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const rows = (await res.json()) as unknown[]
    return Array.isArray(rows) && rows.length > 0
  } catch {
    return null
  }
}

export function isLegacyTestProductSlug(slug: string): boolean {
  return NON_INDEXABLE_SLUG_RE.test(slug)
}

/** Comprueba si hay productos activos que coinciden con una búsqueda (middleware /buscar). */
export async function searchHasActiveProducts(query: string): Promise<boolean | null> {
  const creds = getSupabaseRestEnv()
  const q = query.trim()
  if (!creds || q.length < 2) return null

  const pattern = `%${q.replace(/[%_]/g, '')}%`
  const endpoint = new URL(`${creds.url}/rest/v1/products`)
  endpoint.searchParams.set('select', 'id')
  endpoint.searchParams.set('is_active', 'eq.true')
  endpoint.searchParams.set(
    'or',
    `(name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern})`,
  )
  endpoint.searchParams.set('limit', '1')

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: creds.anonKey,
        Authorization: `Bearer ${creds.anonKey}`,
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const rows = (await res.json()) as unknown[]
    return Array.isArray(rows) && rows.length > 0
  } catch {
    return null
  }
}
