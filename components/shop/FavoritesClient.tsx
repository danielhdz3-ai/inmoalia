'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ArrowRight, Loader2 } from 'lucide-react'
import { useFavoritesStore } from '@/store/favorites'
import ProductCard from '@/components/shop/ProductCard'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

export default function FavoritesClient() {
  const { items: localItems, removeItem } = useFavoritesStore()
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)

      try {
        // Get user's favorite product_ids from DB
        const res = await fetch('/api/favorites')
        const { productIds } = await res.json()

        if (!productIds?.length) {
          setDbProducts([])
          setLoading(false)
          return
        }

        // Fetch full product data for those IDs
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .eq('is_active', true)

        setDbProducts((data as unknown as Product[]) ?? [])
      } catch {
        setDbProducts([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleRemoveDb = async (productId: string) => {
    setDbProducts((prev) => prev?.filter((p) => p.id !== productId) ?? [])
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
  }

  // Decide which list to show
  const items = isLoggedIn === true ? (dbProducts ?? []) : localItems
  const handleRemove = isLoggedIn === true ? handleRemoveDb : removeItem

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#a08c7a] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-[#2d4a3e]" />
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a]">
          Mis favoritos
          {items.length > 0 && (
            <span className="ml-2 text-lg font-normal text-[#a08c7a]">({items.length})</span>
          )}
        </h1>
      </div>

      {!isLoggedIn && items.length === 0 && (
        <div className="mb-6 bg-[#f9f6f1] border border-[#e8ddd0] rounded-xl px-5 py-4 text-sm text-[#6b5344]">
          <Link href="/login?redirect=/favoritos" className="text-[#2d4a3e] font-medium hover:underline">
            Inicia sesión
          </Link>{' '}
          para guardar tus favoritos entre dispositivos y no perderlos.
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f9f6f1] border border-[#e8ddd0] mb-6">
            <Heart className="w-9 h-9 text-[#e8ddd0]" />
          </div>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-2">Aún no tienes favoritos</h2>
          <p className="text-[#a08c7a] mb-8 max-w-sm mx-auto">
            Guarda los productos que más te gusten pulsando el corazón en cualquier producto.
          </p>
          <Button asChild size="xl">
            <Link href="/productos">
              Explorar productos <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-[#c0392b] border border-[#e8ddd0] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#c0392b] hover:text-white hover:border-[#c0392b]"
                title="Eliminar de favoritos"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
