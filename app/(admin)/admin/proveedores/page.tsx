import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Building2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import type { Supplier } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminProveedoresPage() {
  const supabase = adminDb()
  const { data } = await supabase
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true })

  const rows = (data as unknown as Supplier[] | null) ?? []

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('supplier', 'gruposdm')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e]">
          <ChevronLeft className="w-4 h-4" /> Panel admin
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#2d4a3e]/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#2d4a3e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Proveedores</h1>
            <p className="text-sm text-[#a08c7a] mt-0.5">
              Datos de contacto, logística y envíos por proveedor. Los productos se marcan con el{' '}
              <strong className="text-[#6b5344]">código slug</strong> (mismo valor que en cada ficha de producto).
            </p>
            {rows.length > 0 && (
              <p className="text-xs text-[#6b5344] mt-2">
                Actualmente hay <strong>{count ?? 0}</strong> producto(s) con proveedor <code className="text-[11px] bg-[#f9f6f1] px-1 rounded">gruposdm</code>.
              </p>
            )}
          </div>
        </div>
        <Link
          href="/admin/proveedores/nuevo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2d4a3e] text-white text-sm font-medium hover:bg-[#1e3329] shrink-0"
        >
          Nuevo proveedor
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-10 text-center">
          <p className="text-[#6b5344] mb-4">Aún no hay filas en la tabla «suppliers». Ejecuta la migración 016 en Supabase.</p>
          <Link href="/admin/proveedores/nuevo" className="text-[#2d4a3e] font-medium text-sm hover:underline">
            Dar de alta el primero manualmente →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden divide-y divide-[#e8ddd0]">
          {rows.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 hover:bg-[#f9f6f1] transition-colors">
              <div className="min-w-0">
                <p className="font-semibold text-[#2a2a2a]">{s.name}</p>
                <p className="text-xs text-[#a08c7a] font-mono mt-0.5">{s.slug}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#6b5344]">
                  {s.phone && <span>{s.phone}</span>}
                  {s.email && <span>{s.email}</span>}
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-[#2d4a3e] hover:underline">
                      Web
                    </a>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/proveedores/${encodeURIComponent(s.slug)}`}
                className="inline-flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border border-[#e8ddd0] text-sm text-[#6b5344] hover:border-[#2d4a3e] hover:text-[#2d4a3e]"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar ficha
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
