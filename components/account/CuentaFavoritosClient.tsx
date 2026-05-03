'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react'
import { toastOk, toastErr } from '@/lib/toast-client'
import ProductCard from '@/components/shop/ProductCard'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useFavoritesStore } from '@/store/favorites'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/lib/supabase/types'

export default function CuentaFavoritosClient() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(true)
  const removeItemStore = useFavoritesStore((s) => s.removeItem)
  const addToCart = useCartStore((s) => s.addItem)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/favorites')
        const { productIds } = await res.json()

        if (!productIds?.length) {
          if (!cancelled) setProducts([])
          return
        }

        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds as string[])
          .eq('is_active', true)

        const list = (data as unknown as Product[]) ?? []
        if (!cancelled) setProducts(list)
        list.forEach((p) => {
          useFavoritesStore.getState().addItem(p)
        })
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRemove = async (product: Product) => {
    setProducts((prev) => prev?.filter((p) => p.id !== product.id) ?? [])
    removeItemStore(product.id)
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    }).catch(() => {})
    void toastOk('Eliminado de favoritos.')
  }

  const handleCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    if (product.stock <= 0) {
      void toastErr('Producto sin stock.')
      return
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      supplier_sku: product.supplier_sku,
      supplier: product.supplier,
      stock: product.stock,
    })
    void toastOk('Añadido al carrito.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#a08c7a] animate-spin" />
      </div>
    )
  }

  const list = products ?? []

  return (
    <div className="max-w-6xl lg:max-w-none">
      <div className="mb-8">
        <p className="text-sm text-[#a08c7a]">
          <Link href="/cuenta" className="hover:text-[#2d4a3e] transition-all duration-200">
            Mi cuenta
          </Link>
          <span className="text-[#d4c4b0] mx-2 select-none" aria-hidden>
            ·
          </span>
          <span className="text-[#2a2a2a] font-medium">Favoritos</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a] mt-3">Favoritos</h1>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] mt-2 font-medium">
          Lista guardada en tu cuenta
        </p>
        <p className="text-sm text-[#a08c7a] mt-2 leading-relaxed">
          Los mismos productos que marcas con el corazón en la tienda.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center px-6 bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-12 md:p-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f9f6f1] border border-[#e8ddd0] mb-6">
            <Heart className="w-9 h-9 text-[#e8ddd0]" />
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] font-medium mb-3">
            TU LISTA ESTÁ VACÍA
          </p>
          <p className="text-sm text-[#6b5344] mb-10 max-w-md mx-auto leading-relaxed">
            Explora la tienda y guarda tus piezas preferidas para volver cuando quieras.
          </p>
          <Button asChild size="lg" className="transition-all duration-200">
            <Link href="/productos">Volver a la tienda</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((product) => (
            <div key={product.id} className="flex flex-col gap-3">
              <ProductCard product={product} hideFavoriteButton />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-1.5 text-[#6b5344] border-[#e8ddd0] transition-all duration-200"
                  onClick={() => handleRemove(product)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 gap-1.5 transition-all duration-200"
                  disabled={product.stock <= 0}
                  onClick={(e) => handleCart(e, product)}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Al carrito
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
