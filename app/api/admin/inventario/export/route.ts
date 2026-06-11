import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildInventarioCsv, fetchInventarioProducts, type InventarioSearchParams } from '@/lib/admin/inventario'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? '')) {
    return { error: NextResponse.json({ error: 'Sin permisos' }, { status: 403 }) }
  }

  return { error: null }
}

export async function GET(req: NextRequest) {
  const auth = await assertAdmin()
  if (auth.error) return auth.error

  const sp = req.nextUrl.searchParams
  const params: InventarioSearchParams = {
    q: sp.get('q') ?? undefined,
    supplier: sp.get('supplier') ?? undefined,
    active: sp.get('active') ?? undefined,
    stock: sp.get('stock') ?? undefined,
  }

  try {
    const products = await fetchInventarioProducts(params)
    const csv = buildInventarioCsv(products)
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventario-inmoalia-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al exportar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
