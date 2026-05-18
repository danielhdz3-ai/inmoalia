import type { Product } from '@/lib/supabase/types'

type ProductLinkFields = Pick<
  Product,
  'supplier' | 'supplier_sku' | 'supplier_product_url'
>

/** Portales conocidos cuando no hay `supplier_product_url` guardado. */
const SUPPLIER_PORTAL: Record<string, string> = {
  'aw-dropship': 'https://www.aw-dropship.es',
  dropxl: 'https://www.dropxl.com',
  droppery: 'https://droppery.com',
  gruposdm: 'https://www.gruposdm.com',
}

export function resolveSupplierHref(p: ProductLinkFields): string | null {
  const direct = p.supplier_product_url?.trim()
  if (direct) return direct
  const base = p.supplier ? SUPPLIER_PORTAL[p.supplier] : undefined
  return base ?? null
}

/** Etiqueta legible para el proveedor técnico. */
export function formatSupplierLabel(supplier: string | null): string {
  if (!supplier) return '—'
  const map: Record<string, string> = {
    'aw-dropship': 'AW Dropship',
    dropxl: 'dropXL',
    droppery: 'Droppery',
    gruposdm: 'Grupo SDM',
    'operativas-sniper': 'Grupo SDM',
  }
  return map[supplier] ?? supplier
}

/**
 * Margen sobre PVP (comercial típico): (venta − coste) / venta × 100
 */
export function marginOnRetailPct(
  price: number,
  cost: number | null,
): number | null {
  if (cost === null || cost === undefined || price <= 0) return null
  return Math.round(((price - cost) / price) * 1000) / 10
}
