import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/supabase/types'

interface FavoritesStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  toggleItem: (product: Product) => void
  isFavorite: (id: string) => boolean
  getCount: () => number
  /** Con sesión: sube favoritos locales no guardados y descarga los del servidor */
  syncWithServer: () => Promise<void>
}

/** Sync línea puntual al añadir/quitar */
const syncToDb = (productId: string, action: 'add' | 'remove') => {
  const method = action === 'add' ? 'POST' : 'DELETE'
  fetch('/api/favorites', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  }).catch(() => {/* invitados: ignorar */})
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isFavorite(product.id)) {
          set((s) => ({ items: [...s.items, product] }))
          syncToDb(product.id, 'add')
        }
      },

      removeItem: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
        syncToDb(id, 'remove')
      },

      toggleItem: (product) => {
        if (get().isFavorite(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      isFavorite: (id) => get().items.some((i) => i.id === id),

      getCount: () => get().items.length,

      syncWithServer: async () => {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return

          let res = await fetch('/api/favorites')
          if (!res.ok) return
          let { productIds = [] }: { productIds?: string[] } = await res.json()

          const localItems = get().items
          for (const p of localItems) {
            if (!productIds.includes(p.id)) {
              await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: p.id }),
              }).catch(() => {})
            }
          }

          res = await fetch('/api/favorites')
          if (!res.ok) return
          ;({ productIds = [] } = await res.json())

          const have = new Set(get().items.map((i) => i.id))
          const missing = productIds.filter((id) => !have.has(id))
          if (!missing.length) return

          const { data } = await supabase
            .from('products')
            .select('*')
            .in('id', missing)
            .eq('is_active', true)

          if (!data?.length) return

          set((s) => {
            const byId = new Map(s.items.map((item) => [item.id, item]))
            ;(data as unknown as Product[]).forEach((row) => byId.set(row.id, row))
            return { items: [...byId.values()] }
          })
        } catch {
          /* silencioso — red o sesión caducada */
        }
      },
    }),
    {
      name: 'inmoalia-favorites',
    }
  )
)
