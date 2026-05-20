import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ClipboardList, ChevronLeft, ExternalLink, Pencil, PackageSearch } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/supabase/types'
import { formatSupplierLabel, marginNetEur, marginOnRetailPct, resolveSupplierHref } from '@/lib/suppliers'

export const dynamic = 'force-dynamic'

interface SearchParams {
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

async function fetchInventario(params: SearchParams) {
  const supabase = adminDb()

  let q = supabase
    .from('products')
    .select(
      'id, slug, name, sku, supplier_sku, supplier, supplier_product_url, cost_price, price, stock, is_active, images',
    )
    .order('name', { ascending: true })

  if (params.supplier) {
    q = q.eq('supplier', params.supplier)
  }

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

  const { data } = await q
  const rows = (data as unknown as Product[]) ?? []

  const { data: dirSlugRows } = await supabase.from('suppliers').select('slug').eq('is_active', true)
  const fromDirectory = (dirSlugRows as { slug: string }[] | null)?.map((r) => r.slug) ?? []

  const { data: supRows } = await supabase.from('products').select('supplier')
  const fromProducts = (supRows as { supplier: string | null }[] | null)?.map((r) => r.supplier).filter(Boolean) as string[]

  const supplierOptions = Array.from(new Set([...fromDirectory, ...fromProducts])).sort()

  return { rows, supplierOptions }
}

async function aggregateStats() {
  const supabase = adminDb()

  const { count: total } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: low } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock', 5)
    .eq('is_active', true)

  const { count: noCost } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('cost_price', null)
    .eq('is_active', true)

  return {
    total: total ?? 0,
    lowStock: low ?? 0,
    activeNoCost: noCost ?? 0,
  }
}

export default async function AdminInventarioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const [{ rows, supplierOptions }, stats] = await Promise.all([
    fetchInventario(sp),
    aggregateStats(),
  ])

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e]">
          <ChevronLeft className="w-4 h-4" /> Panel admin
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#2d4a3e]/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-[#2d4a3e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Inventario</h1>
            <p className="text-sm text-[#a08c7a] mt-0.5">
              Stock, coste, PVP, proveedor y enlaces. Vista operativa del catálogo.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d4a3e] text-white text-sm font-medium hover:bg-[#1e3329]"
          >
            <PackageSearch className="w-4 h-4" />
            Nuevo producto
          </Link>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e8ddd0] text-sm text-[#6b5344] hover:bg-white"
          >
            Catálogo (edición rápida)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'SKU en catálogo', value: stats.total, hint: 'Todas las filas productos' },
          { label: 'Activos · stock ≤5', value: stats.lowStock, hint: 'Revisión reposición' },
          { label: 'Activos sin coste', value: stats.activeNoCost, hint: 'Marcar cost_price en proveedor' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#e8ddd0] p-5">
            <p className="text-2xl font-bold text-[#2a2a2a]">{c.value}</p>
            <p className="text-xs font-medium text-[#6b5344] mt-1">{c.label}</p>
            <p className="text-[11px] text-[#a08c7a] mt-0.5">{c.hint}</p>
          </div>
        ))}
      </div>

      <form method="GET" action="/admin/inventario" className="bg-white rounded-2xl border border-[#e8ddd0] p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-medium text-[#a08c7a] uppercase tracking-wide mb-1">Buscar</label>
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Nombre, SKU tienda o SKU proveedor"
            className="w-full h-9 px-3 rounded-lg border border-[#e8ddd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/25"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#a08c7a] uppercase tracking-wide mb-1">Proveedor</label>
          <select
            name="supplier"
            defaultValue={sp.supplier ?? ''}
            className="h-9 min-w-[140px] px-2 rounded-lg border border-[#e8ddd0] text-sm bg-white"
          >
            <option value="">Todos</option>
            {supplierOptions.map((s) => (
              <option key={s} value={s}>{formatSupplierLabel(s)} ({s})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#a08c7a] uppercase tracking-wide mb-1">Activos</label>
          <select
            name="active"
            defaultValue={sp.active ?? ''}
            className="h-9 px-2 rounded-lg border border-[#e8ddd0] text-sm bg-white"
          >
            <option value="">Todos</option>
            <option value="1">Solo activos</option>
            <option value="0">Solo inactivos</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#a08c7a] uppercase tracking-wide mb-1">Stock</label>
          <select
            name="stock"
            defaultValue={sp.stock ?? ''}
            className="h-9 px-2 rounded-lg border border-[#e8ddd0] text-sm bg-white"
          >
            <option value="">Cualquier</option>
            <option value="low">Stock bajo (1–5)</option>
            <option value="out">Sin stock (0)</option>
          </select>
        </div>
        <button type="submit" className="h-9 px-4 rounded-lg bg-[#2d4a3e] text-white text-sm font-medium">
          Filtrar
        </button>
        <Link href="/admin/inventario" className="h-9 px-3 flex items-center text-sm text-[#a08c7a] hover:text-[#2d4a3e]">
          Limpiar
        </Link>
      </form>

      <p className="text-xs text-[#a08c7a] mb-3">{rows.length} resultado(s).</p>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#e8ddd0] bg-[#f9f6f1]">
                <th className="text-left px-3 py-2.5 font-medium text-[#a08c7a]">Producto</th>
                <th className="text-left px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">Proveedor</th>
                <th className="text-right px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">Coste</th>
                <th className="text-right px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">PVP</th>
                <th className="text-right px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">Margen %</th>
                <th className="text-right px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">Neto €</th>
                <th className="text-right px-2 py-2.5 font-medium text-[#a08c7a] whitespace-nowrap">Stock</th>
                <th className="text-center px-2 py-2.5 font-medium text-[#a08c7a]">Enlaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ddd0]">
              {rows.map((product) => {
                const margen = marginOnRetailPct(Number(product.price), product.cost_price)
                const neto = marginNetEur(Number(product.price), product.cost_price)
                const supplierUrl = resolveSupplierHref(product)
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-[#f9f6f1] transition-colors ${!product.is_active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-9 h-9 object-cover rounded-md border border-[#e8ddd0]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-[#e8ddd0]" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#2a2a2a] truncate max-w-[200px]" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-[11px] text-[#a08c7a]">
                            {product.sku && <span>SKU {product.sku}</span>}
                            {product.supplier_sku && (
                              <span> · Prov. {product.supplier_sku}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-[#6b5344] whitespace-nowrap">
                      <div>{formatSupplierLabel(product.supplier)}</div>
                      {product.supplier && (
                        <span className="text-[10px] text-[#a08c7a] font-mono">{product.supplier}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right whitespace-nowrap text-[#6b5344]">
                      {product.cost_price != null ? formatPrice(Number(product.cost_price)) : '—'}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap text-[#2a2a2a]">
                      {formatPrice(Number(product.price))}
                    </td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">
                      {margen != null ? (
                        <span className={`font-medium ${margen >= 30 ? 'text-[#27ae60]' : 'text-[#c9a84c]'}`}>
                          {margen}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-2 text-right whitespace-nowrap font-medium text-[#2a2a2a]">
                      {neto != null ? formatPrice(neto) : '—'}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span
                        className={`font-medium whitespace-nowrap ${
                          product.stock === 0
                            ? 'text-[#c0392b]'
                            : product.stock <= 5
                              ? 'text-[#c9a84c]'
                              : 'text-[#27ae60]'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/productos/${product.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[#2d4a3e] hover:underline shrink-0"
                          title="Ver en tienda"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline text-[11px]">Tienda</span>
                        </Link>
                        {supplierUrl ? (
                          <Link
                            href={supplierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#8e44ad] hover:underline shrink-0"
                            title="Portal / ficha proveedor"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline text-[11px]">Prov.</span>
                          </Link>
                        ) : (
                          <span className="text-[#c8bdb5]" title="Añade URL en edición de producto">
                            —
                          </span>
                        )}
                        <Link href={`/admin/productos/${product.id}`} className="text-[#a08c7a] hover:text-[#2d4a3e] p-1" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="text-center py-12 text-[#a08c7a] text-sm">No hay filas para estos filtros.</p>
        )}
      </div>

      <p className="text-[11px] text-[#a08c7a] mt-4 max-w-3xl">
        <strong>Margen %:</strong> (PVP − coste) / PVP. <strong>Neto €:</strong> ganancia en euros por unidad vendida (PVP − coste).
        Para un enlace directo a una ficha AW, edita el producto y rellena <em>URL proveedor</em>.
        Sin URL, AW usa el portal genérico; dropXL/Droppery según corresponda.
      </p>
    </div>
  )
}
