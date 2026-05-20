'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Package,
  CheckCircle,
  Maximize2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { useFavoritesStore } from '@/store/favorites'
import { formatPrice } from '@/lib/utils'
import { toastOk, toastErr } from '@/lib/toast-client'
import { getDiscountAmount, getDiscountPercent, getListPrice } from '@/lib/shop/product-pricing'
import type { Product } from '@/lib/supabase/types'
import ProductCard from './ProductCard'
import WaitlistForm from './WaitlistForm'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState({ x: 0, y: 0, isZooming: false })
  const addItem = useCartStore((s) => s.addItem)
  const toggleFavorite = useFavoritesStore((s) => s.toggleItem)
  const isWishlisted = useFavoritesStore((s) => s.isFavorite(product.id))

  const dimensions = product.dimensions as { width?: number; height?: number; depth?: number } | null

  /**
   * Texto público sin datos de suministro (solo en admin).
   * También recorta líneas sueltas que citen proveedor / marcas mayoristas.
   */
  const publicDescription = (() => {
    let t = product.description ?? ''
    t = t.replace(/\s*Referencia proveedor[^.]*\.?/gi, '')
    t = t
      .split(/\r?\n/)
      .filter((line) => {
        const lower = line.toLowerCase()
        if (/proveedor/.test(lower)) return false
        if (/gruposdm|grupo\s*sdm/i.test(line)) return false
        return true
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    return t
  })()

  const activeImageSrc = product.images[selectedImage] ?? product.images[0] ?? ''

  const handleShare = useCallback(async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/productos/${product.slug}`
        : ''
    if (!url) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.name,
          url,
        })
        return
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      void toastOk('Enlace copiado al portapapeles')
    } catch {
      void toastErr('No se pudo copiar el enlace. Cópialo desde la barra de dirección.')
    }
  }, [product.name, product.slug])

  useEffect(() => {
    if (!lightboxOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxOpen])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (product.images.length <= 1) return
      if (e.key === 'ArrowRight') {
        setSelectedImage((i) => (i + 1) % product.images.length)
      }
      if (e.key === 'ArrowLeft') {
        setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, product.images.length])

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const listPrice = getListPrice(product)
  const discountPct = getDiscountPercent(product)
  const discountAmount = getDiscountAmount(product)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setImageZoom({ x, y, isZooming: true })
  }

  const handleMouseLeave = () => {
    setImageZoom({ x: 0, y: 0, isZooming: false })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#a08c7a] mb-6">
        <Link href="/" className="hover:text-[#2d4a3e] transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/productos" className="hover:text-[#2d4a3e] transition-colors">Productos</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/categorias/${product.category}`} className="hover:text-[#2d4a3e] transition-colors capitalize">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2a2a2a] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => activeImageSrc && setLightboxOpen(true)}
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#f9f6f1] border border-[#e8ddd0] cursor-zoom-in ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#2d4a3e] transition-all duration-200 hover:border-[#a08c7a]"
            role="button"
            tabIndex={0}
            aria-label="Ver imagen a pantalla completa"
          >
            {activeImageSrc ? (
              <Image
                src={activeImageSrc}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: imageZoom.isZooming ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : null}
            {product.is_featured && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <Badge variant="gold">Destacado</Badge>
              </div>
            )}
            {discountPct && (
              <div className="absolute top-4 right-14 pointer-events-none">
                <Badge variant="sale">-{discountPct}%</Badge>
              </div>
            )}
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/55 text-white text-xs px-3 py-1.5 pointer-events-none backdrop-blur-sm">
              <Maximize2 className="w-3.5 h-3.5" aria-hidden />
              Pantalla completa
            </span>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  type="button"
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? 'border-[#2d4a3e] shadow-md'
                      : 'border-[#e8ddd0] hover:border-[#a08c7a]'
                  }`}
                  aria-label={`Imagen ${i + 1} de ${product.images.length}`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Category + SKU */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/categorias/${product.category}`}
              className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wider hover:text-[#2d4a3e] transition-colors"
            >
              {product.subcategory || product.category}
            </Link>
            {product.sku && (
              <span className="text-xs text-[#a08c7a]">Ref: {product.sku}</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-[#2a2a2a]">
              {formatPrice(product.price)}
            </span>
            {listPrice != null && discountAmount != null && (
              <>
                <span className="text-lg text-[#a08c7a] line-through">
                  {formatPrice(listPrice)}
                </span>
                <Badge variant="sale">
                  {discountPct != null ? `-${discountPct}%` : `Ahorras ${formatPrice(discountAmount)}`}
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#27ae60]" />
                <span className="text-sm text-[#27ae60] font-medium">
                  En stock ({product.stock} {product.stock === 1 ? 'unidad' : 'unidades'})
                </span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4 text-[#a08c7a]" />
                <span className="text-sm text-[#a08c7a]">Sin stock — Añadir a lista de espera</span>
              </>
            )}
          </div>

          {/* Add to cart / waitlist + acciones */}
          <div className="space-y-3 mb-8">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="flex-1 gap-2 transition-all duration-200"
                onClick={() => toggleFavorite(product)}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#c0392b] text-[#c0392b]' : ''}`} />
                {isWishlisted ? 'En favoritos' : 'Favoritos'}
              </Button>
              <Button variant="secondary" size="sm" type="button" className="flex-1 gap-2 transition-all duration-200" onClick={() => void handleShare()}>
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            {product.stock > 0 ? (
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <div className="flex items-center bg-[#f9f6f1] border border-[#e8ddd0] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#6b5344]" />
                  </button>
                  <span className="w-10 text-center font-semibold text-[#2a2a2a]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#6b5344]" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 min-w-[200px] gap-2"
                  variant={added ? 'secondary' : 'default'}
                >
                  {added ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      ¡Añadido!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Añadir al carrito
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <WaitlistForm productId={product.id} />
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3 py-6 border-t border-[#e8ddd0]">
            {[
              { icon: Truck, text: 'Envío gratis en pedidos desde 600€. Entrega en 2-5 días.' },
              { icon: Shield, text: 'Pago 100% seguro con cifrado SSL. Stripe certificado.' },
              { icon: RotateCcw, text: 'Devolución gratuita en 30 días sin preguntas.' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#2d4a3e] shrink-0" />
                <span className="text-sm text-[#6b5344]">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Specs */}
          <div className="mt-6 pt-6 border-t border-[#e8ddd0]">
            <h3 className="text-sm font-semibold text-[#2a2a2a] mb-4">Especificaciones</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {product.material && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Material</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.material}</dd>
                </>
              )}
              {product.color && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Color</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.color}</dd>
                </>
              )}
              {dimensions && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Dimensiones</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">
                    {dimensions.width && dimensions.height && dimensions.depth
                      ? `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`
                      : '-'}
                  </dd>
                </>
              )}
              {product.weight_kg && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Peso</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.weight_kg} kg</dd>
                </>
              )}
            </dl>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#e8ddd0]">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/productos?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full border border-[#e8ddd0] text-[#6b5344] hover:border-[#2d4a3e] hover:text-[#2d4a3e] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox pantalla completa */}
      {lightboxOpen && activeImageSrc ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/96"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-lightbox-label"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-white shrink-0">
            <p id="product-lightbox-label" className="text-sm font-medium truncate pr-6">
              {product.name}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="shrink-0 rounded-full bg-white/10 p-2.5 hover:bg-white/20 transition-all duration-200"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center px-2 md:px-8 pb-6 min-h-0"
            role="presentation"
            onClick={() => setLightboxOpen(false)}
          >
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)
                  }}
                  className="absolute left-2 md:left-6 z-20 rounded-full bg-white/15 p-3 hover:bg-white/25 transition-all duration-200 text-white hidden sm:flex items-center justify-center"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((i) => (i + 1) % product.images.length)
                  }}
                  className="absolute right-2 md:right-6 z-20 rounded-full bg-white/15 p-3 hover:bg-white/25 transition-all duration-200 text-white hidden sm:flex items-center justify-center"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="relative z-10 w-full max-w-[min(100vw,1280px)] h-[min(85vh,calc(100vw-32px))] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImageSrc}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          <p className="text-white/65 text-xs text-center pb-3 px-4 shrink-0">
            ESC para cerrar
            {product.images.length > 1 ? ' · flechas ◀ ▶ para otras fotos' : ''}
          </p>
        </div>
      ) : null}

      {/* Description */}
      {publicDescription && (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-[#2a2a2a] mb-4">Descripción del producto</h2>
          <p className="text-[#6b5344] leading-relaxed text-base">{publicDescription}</p>
        </section>
      )}

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#e8ddd0]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#2a2a2a]">También te puede gustar</h2>
            <Link
              href={`/categorias/${product.category}`}
              className="text-sm text-[#2d4a3e] hover:text-[#1e3329] font-medium transition-colors"
            >
              Ver más →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
