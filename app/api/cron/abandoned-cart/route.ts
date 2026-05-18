import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAbandonedCartReminder } from '@/lib/resend/emails'
import { isResendConfigured } from '@/lib/resend/config'

export const runtime = 'nodejs'

function assertCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    return req.headers.get('authorization') === `Bearer ${secret}`
  }
  return req.headers.get('x-vercel-cron') === '1'
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const HOURS_IDLE = 36
const MAX_SNAPSHOT_AGE_DAYS = 14

/** Vercel Cron o llamada manual con Authorization: Bearer CRON_SECRET */
export async function GET(req: NextRequest) {
  if (!assertCronAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'resend_disabled' })
  }

  try {
    const cutoff = new Date(Date.now() - HOURS_IDLE * 60 * 60 * 1000).toISOString()
    const tooOld = new Date(Date.now() - MAX_SNAPSHOT_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const supabase = admin()

    const { data: rows, error } = await supabase
      .from('abandoned_cart_snapshots')
      .select('*')
      .is('discarded_at', null)
      .is('reminder_sent_at', null)
      .eq('consent_reminder', true)
      .lt('last_activity_at', cutoff)
      .gt('last_activity_at', tooOld)
      .limit(40)

    if (error) throw error

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
    let processed = 0

    for (const row of rows ?? []) {
      type CartEl = { name?: string }
      const cart = row.cart as CartEl[]
      const productNames =
        Array.isArray(cart)
          ? cart.map((i) => (typeof i?.name === 'string' ? i.name : '')).filter(Boolean)
          : []

      const resumeUrl = `${site.replace(/\/$/, '')}/carrito?recovery=${encodeURIComponent(row.recovery_token)}`

      try {
        await sendAbandonedCartReminder({
          to: row.email,
          resumeUrl,
          productNames,
        })
        await supabase
          .from('abandoned_cart_snapshots')
          .update({ reminder_sent_at: new Date().toISOString() } as never)
          .eq('id', row.id)
        processed += 1
      } catch (e) {
        console.error('abandoned-cart reminder:', row.id, e)
      }
    }

    return NextResponse.json({ ok: true, processed, candidates: rows?.length ?? 0 })
  } catch (err) {
    console.error('cron abandoned-cart:', err)
    return NextResponse.json({ error: 'cron_failed' }, { status: 500 })
  }
}
