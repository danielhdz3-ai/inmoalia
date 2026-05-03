import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/favorites — lista de product_ids del usuario autenticado
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ productIds: [] })

  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)

  const productIds = (data ?? []).map((r: { product_id: string }) => r.product_id)
  return NextResponse.json({ productIds })
}

// POST /api/favorites — añadir favorito { productId }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  await supabase
    .from('favorites')
    .upsert({ user_id: user.id, product_id: productId } as never, { onConflict: 'user_id,product_id' })

  return NextResponse.json({ ok: true })
}

// DELETE /api/favorites — eliminar favorito { productId }
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  return NextResponse.json({ ok: true })
}
