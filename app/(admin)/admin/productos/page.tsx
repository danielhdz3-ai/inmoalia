import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Package, ChevronLeft, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function toggleProductActive(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentActive = formData.get('is_active') === 'true'
  const supabase = createAdminClient()
  await supabase.from('products').update({ is_active: !currentActive }).eq('id', id)
  revalidatePath('/admin/productos')
}

const STATUS_MAP: Record<string, string> = {
  jardin: 'Jardín', mesas: 'Mesas', sillas: 'Sillas', iluminacion: 'Iluminación',
  decoracion: 'Decoración', textil: 'Textil', muebles: 'Muebles', outlet: 'Outlet',
}

export default async function AdminProductosPage() {
  const supabase = createAdminClient()

  const { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false })

  const products = rawProducts as unknown as Product[] | null

  const active = products?.filter((p) => p.is_active).length ?? 0
  const inactive = (products?.length ?? 0) - active

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Panel admin
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Productos</h1>
          <p className="text-sm text-[#a08c7a] mt-0.5">
            {products?.length ?? 0} totales · {active} activos · {inactive} inactivos
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total productos', value: products?.length ?? 0, color: 'text-[#2a2a2a]', bg: 'bg-[#f9f6f1]' },
          { label: 'Activos (visibles)', value: active, color: 'text-[#27ae60]', bg: 'bg-[#27ae60]/10' },
          { label: 'Inactivos (ocultos)', value: inactive, color: 'text-[#c0392b]', bg: 'bg-[#c0392b]/10' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-2xl border border-[#e8ddd0] p-5`}>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-[#a08c7a] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e8ddd0]">
          <Package className="w-4 h-4 text-[#2d4a3e]" />
          <h2 className="font-semibold text-[#2a2a2a]">Catálogo de productos</h2>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 text-[#a08c7a] text-sm">
            No hay productos sincronizados aún.{' '}
            <Link href="/admin/sincronizacion" className="text-[#2d4a3e] hover:underline">
              Sincronizar catálogo →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8ddd0] bg-[#f9f6f1]">
                  <th className="text-left px-6 py-3 font-medium text-[#a08c7a]">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-[#a08c7a] hidden md:table-cell">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-[#a08c7a]">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-[#a08c7a] hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-[#a08c7a] hidden lg:table-cell">Actualizado</th>
                  <th className="text-center px-4 py-3 font-medium text-[#a08c7a]">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ddd0]">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-[#f9f6f1] transition-colors ${!product.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#e8ddd0] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#e8ddd0] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#2a2a2a] truncate max-w-[200px]">{product.name}</p>
                          {product.sku && <p className="text-xs text-[#a08c7a]">SKU: {product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#6b5344]">
                      {STATUS_MAP[product.category] ?? product.category}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#2a2a2a]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className={`font-medium ${product.stock === 0 ? 'text-[#c0392b]' : product.stock < 5 ? 'text-[#c9a84c]' : 'text-[#27ae60]'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#a08c7a] text-xs">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="is_active" value={String(product.is_active)} />
                        <button
                          type="submit"
                          title={product.is_active ? 'Desactivar' : 'Activar'}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                            product.is_active
                              ? 'bg-[#27ae60]/10 text-[#27ae60] hover:bg-[#27ae60]/20'
                              : 'bg-[#e8ddd0] text-[#a08c7a] hover:bg-[#ddd0c5]'
                          }`}
                        >
                          {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/productos/${product.slug}`}
                        target="_blank"
                        className="text-[#a08c7a] hover:text-[#2d4a3e] transition-colors"
                        title="Ver en tienda"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
