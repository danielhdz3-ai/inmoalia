'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { getDiscountPercent, getListPrice } from '@/lib/shop/product-pricing'
import type { Product } from '@/lib/supabase/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
  /** Oculta el botón del corazón (p. ej. en /cuenta/favoritos con acciones propias) */
  hideFavoriteButton?: boolean
}

export default function ProductCard({ product, priority = false, hideFavoriteButton = false }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const toggleFavorite = useFavoritesStore((s) => s.toggleItem)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))

  const images = product.images.filter(Boolean)
  const hasMultipleImages = images.length > 1

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      supplier_sku: product.supplier_sku,
      supplier: product.supplier,
      stock: product.stock,
    })
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const listPrice = getListPrice(product)
  const discountPct = getDiscountPercent(product)

  // Extraer dimensiones del JSON si existen
  const dimensions = product.dimensions as any
  const dimensionText = dimensions?.largo 
    ? `${dimensions.largo}×${dimensions.ancho}${dimensions.altura ? '×' + dimensions.altura : ''} ${dimensions.unidad || 'cm'}`
    : null

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-[#f9f6f1] border border-[#e8ddd0] hover:border-[#d4c4b0] transition-all duration-200 hover:shadow-md">
        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden"
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
        >
          <Image
            src={images[imageIndex] ?? images[0] ?? ''}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />

          {/* Image navigation */}
          {hasMultipleImages && showDetails && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4 text-[#2a2a2a]" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 z-10"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-4 h-4 text-[#2a2a2a]" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setImageIndex(idx)
                    }}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all duration-200',
                      idx === imageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                    )}
                    aria-label={`Ver imagen ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Details overlay eliminado */}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.category === 'ofertas' && (
              <Badge variant="sale" className="text-[10px] py-0.5">Oferta</Badge>
            )}
            {product.is_featured && (
              <Badge variant="gold" className="text-[10px] py-0.5">Destacado</Badge>
            )}
            {discountPct && discountPct > 0 && (
              <Badge variant="sale" className="text-[10px] py-0.5">-{discountPct}%</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="text-[10px] py-0.5">Sin stock</Badge>
            )}
          </div>

          {/* Wishlist */}
          {!hideFavoriteButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleFavorite(product)
              }}
              className={cn(
                'absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm',
                isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors duration-200',
                  isFavorite ? 'fill-[#c0392b] text-[#c0392b]' : 'text-[#6b5344]'
                )}
              />
            </button>
          )}

          {/* Quick add */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button
                type="button"
                onClick={handleAddToCart}
                size="sm"
                className="w-full gap-2 shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                Añadir al carrito
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-[#a08c7a] uppercase tracking-wider mb-1 font-medium">
            {product.subcategory || product.category}
          </p>
          <h3 className="text-sm font-medium text-[#2a2a2a] line-clamp-2 leading-snug mb-2 group-hover:text-[#2d4a3e] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#2a2a2a]">
                {formatPrice(product.price)}
              </span>
              {listPrice != null && (
                <span className="text-xs text-[#a08c7a] line-through">
                  {formatPrice(listPrice)}
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] text-[#c0392b] font-medium">
                ¡Solo {product.stock}!
              </span>
            )}
          </div>

          {/* Material tag */}
          {product.material && (
            <p className="text-[11px] text-[#a08c7a] mt-1.5">{product.material}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
