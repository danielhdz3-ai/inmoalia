import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Asegura sesión válida y, si ADMIN_EMAILS está definido,
 * email incluido en la lista. Alineado con middleware.ts (/admin).
 */
export async function assertAdmin(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? '')) {
    redirect('/')
  }
}
