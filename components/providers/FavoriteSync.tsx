'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFavoritesStore } from '@/store/favorites'

/** Tras login o al cargar con sesión, fusiona favoritos servidor ↔ LocalStorage */
export default function FavoriteSync() {
  const syncWithServer = useFavoritesStore((s) => s.syncWithServer)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || cancelled) return
      await syncWithServer()
    })()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') void syncWithServer()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [syncWithServer])

  return null
}
