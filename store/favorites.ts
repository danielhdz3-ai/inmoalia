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
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isFavorite(product.id)) {
          set((s) => ({ items: [...s.items, product] }))
        }
      },

      removeItem: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
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
    }),
    {
      name: 'inmoalia-favorites',
    }
  )
)
