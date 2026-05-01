'use client'

import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { useFavoritesStore } from '@/store/favorites'
import ProductCard from '@/components/shop/ProductCard'
import { Button } from '@/components/ui/button'

export default function FavoritesClient() {
  const items = useFavoritesStore((s) => s.items)

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
