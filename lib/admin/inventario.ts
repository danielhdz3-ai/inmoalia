import { createClient } from '@supabase/supabase-js'
import type { Product } from '@/lib/supabase/types'
import { getProductCostBreakdown } from '@/lib/shop/pricing'
import { formatSupplierLabel, resolveSupplierHref } from '@/lib/suppliers'
import { getSiteUrl } from '@/lib/site'

export interface InventarioSearchParams {
  supplier?: string
  active?: string
  stock?: string
  q?: string
}

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function fetchInventarioProducts(params: InventarioSearchParams) {
  const supabase = adminDb()

  let q = supabase
    .from('products')
    .select(
      'id, slug, name, sku, supplier_sku, supplier, supplier_product_url, cost_price, price, stock, is_active, images',
    )
    .order('name', { ascending: true })

  if (params.supplier) q = q.eq('supplier', params.supplier)
  if (params.active === '1') q = q.eq('is_active', true)
  if (params.active === '0') q = q.eq('is_active', false)
  if (params.stock === 'low') q = q.lte('stock', 5).gt('stock', 0)
  if (params.stock === 'out') q = q.eq('stock', 0)

  if (params.q?.trim()) {
    const raw = params.q.trim().slice(0, 80).replace(/[%,*_]/g, '')
    if (raw) {
      const pat = `%${raw}%`
      q = q.or(`name.ilike.${pat},sku.ilike.${pat},supplier_sku.ilike.${pat}`)
    }
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)

  return (data as unknown as Product[]) ?? []
}

export async function fetchInventarioSupplierOptions() {
  const supabase = adminDb()

  const { data: dirSlugRows } = await supabase.from('suppliers').select('slug').eq('is_active', true)
  const fromDirectory = (dirSlugRows as { slug: string }[] | null)?.map((r) => r.slug) ?? []

  const { data: supRows } = await supabase.from('products').select('supplier')
  const fromProducts = (supRows as { supplier: string | null }[] | null)
    ?.map((r) => r.supplier)
    .filter(Boolean) as string[]

  return Array.from(new Set([...fromDirectory, ...fromProducts])).sort()
}

function csvCell(value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Genera CSV del inventario (UTF-8 con BOM para Excel). */
export function buildInventarioCsv(products: Product[]): string {
  const site = getSiteUrl()
  const headers = [
    'Producto',
    'SKU tienda',
    'SKU proveedor',
    'Proveedor',
    'Activo',
    'Coste €',
    'IVA €',
    'Transporte €',
    'PVP € (IVA incl.)',
    'Margen %',
    'Neto €',
    'Stock',
    'URL tienda',
    'URL proveedor',
  ]

  const lines = products.map((product) => {
    const b = getProductCostBreakdown(Number(product.price), product.cost_price)
    const supplierUrl = resolveSupplierHref(product)
    return [
      product.name,
      product.sku ?? '',
      product.supplier_sku ?? '',
      formatSupplierLabel(product.supplier),
      product.is_active ? 'Sí' : 'No',
      b.coste ?? '',
      b.iva,
      b.transporte,
      b.pvpConIva,
      b.margenPct ?? '',
      b.neto ?? '',
      product.stock,
      `${site}/productos/${product.slug}`,
      supplierUrl ?? '',
    ]
      .map(csvCell)
      .join(',')
  })

  return `\uFEFF${headers.map(csvCell).join(',')}\n${lines.join('\n')}\n`
}

export function inventarioExportHref(params: InventarioSearchParams): string {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.supplier) qs.set('supplier', params.supplier)
  if (params.active) qs.set('active', params.active)
  if (params.stock) qs.set('stock', params.stock)
  const query = qs.toString()
  return `/api/admin/inventario/export${query ? `?${query}` : ''}`
}
