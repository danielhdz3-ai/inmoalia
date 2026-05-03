import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Proxy interno para la sincronización de catálogo.
 * Verifica que el usuario sea admin y llama a /api/sync con el secreto server-side.
 * Evita exponer SYNC_SECRET_KEY al cliente.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await req.json()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const syncRes = await fetch(`${siteUrl}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SYNC_SECRET_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const data = await syncRes.json()
  return NextResponse.json(data, { status: syncRes.status })
}
