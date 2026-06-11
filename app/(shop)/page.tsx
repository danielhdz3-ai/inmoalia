import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, Shield, RotateCcw, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import NewsletterForm from '@/components/shop/NewsletterForm'
import { Button } from '@/components/ui/button'
import { absoluteUrl } from '@/lib/site'
import type { Product } from '@/lib/supabase/types'
import { DELIVERY_TIME_ASCII } from '@/lib/shop/shipping'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'INMOALIA — Tienda de Muebles, Jardín y Decoración',
    description:
      'Tienda online de muebles y decoración de calidad europea para hogar, jardín y oficina. Envío en 4-8 días a toda España. No confundir con agencias inmobiliarias.',
    alternates: { canonical: absoluteUrl('/') },
  }
}

const CATEGORIES = [
  { slug: 'jardin', name: 'Jardín', emoji: '🌿', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
  { slug: 'mesas', name: 'Mesas', emoji: '🪑', image: '/imagenes/productos/mesa-de-oficina-arezzo-160-con-mueble-auxiliar-blanco-y-roble-1.jpg' },
  { slug: 'sillas', name: 'Sillas', emoji: '🛋️', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80' },
  { slug: 'iluminacion', name: 'Iluminación', emoji: '💡', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80' },
  { slug: 'muebles', name: 'Muebles', emoji: '🛋️', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
]

const BENEFITS = [
  { icon: Truck, title: 'Envío incluido', desc: `Transporte incluido en el precio. Entrega en ${DELIVERY_TIME_ASCII} a toda España.` },
  { icon: Shield, title: 'Pago 100% seguro', desc: 'Stripe. Tarjeta, PayPal, Google Pay y más.' },
  { icon: RotateCcw, title: 'Devoluciones fáciles', desc: '30 días para devoluciones sin preguntas.' },
  { icon: Star, title: 'Calidad seleccionada', desc: 'Cada producto pasa por nuestro control de calidad.' },
]

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as unknown as Product[]) ?? []
  } catch {
    return []
  }
}

async function getNewProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
    return (data as unknown as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ])

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=90"
            alt="Interior nórdico INMOALIA"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a2a2a]/75 via-[#2a2a2a]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-xl">
            <span className="inline-block bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border border-[#c9a84c]/30 mb-6">
              Nueva colección 2024
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Tu hogar,<br />
              <span className="text-[#c9a84c]">rediseñado.</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-md">
              Muebles y decoración de calidad europea. Estilo nórdico y mediterráneo, sin intermediarios, a tu puerta en {DELIVERY_TIME_ASCII}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="xl" className="shadow-lg">
                <Link href="/productos">
                  Ver colección <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                <Link href="/categorias/jardin">Jardín y terraza</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-white/40" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-[#2d4a3e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{benefit.title}</p>
                  <p className="text-xs text-white/60 leading-tight mt-0.5 hidden md:block">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 md:py-24 bg-[#fdfcfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2a2a2a] mb-3">
              Explora por categoría
            </h2>
            <p className="text-[#a08c7a] text-base max-w-md mx-auto">
              Desde el jardín hasta el salón, encuentra tu estilo en cada rincón.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categorias/${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-[#f9f6f1] border border-[#e8ddd0] hover:border-[#a08c7a] transition-all hover:shadow-md"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a]/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <p className="text-white text-sm font-semibold leading-tight">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24 bg-[#f9f6f1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#2a2a2a] mb-2">
                  Selección destacada
                </h2>
                <p className="text-[#a08c7a]">Los favoritos de nuestra comunidad</p>
              </div>
              <Link
                href="/productos"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#2d4a3e] hover:text-[#1e3329] transition-colors"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Button asChild variant="outline">
                <Link href="/productos">Ver todos los productos</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* BANNER JARDÍN — degradado verdoso base + foto decorativa (alt vacío si falla la carga) */}
      <section className="relative py-24 md:py-36 overflow-hidden min-h-[min(70vh,520px)] flex items-center">
        <div className="absolute inset-0" aria-hidden>
          {/* Capa fija verde-esmeralda: siempre visible aunque falle la imagen */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22] via-[#0d5c4a] to-[#134e4a]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#34d399]/25 via-transparent to-[#065f46]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(167,243,208,0.35)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_100%,rgba(6,78,59,0.55)_0%,transparent_50%)]" />
          <Image
            src="https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=88"
            alt=""
            fill
            className="object-cover opacity-[0.45] scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#022c22]/50 via-transparent to-[#022c22]/85" />
          <div className="absolute inset-0 ring-1 ring-white/10" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center text-white w-full">
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase mb-4 block">
            Colección exterior
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Transforma tu jardín<br />en un oasis
          </h2>
          <p className="text-white/80 text-lg max-w-lg mx-auto mb-8">
            Conjuntos de ratán, tumbonas, pérgolas y mucho más. Todo lo que necesitas para vivir el exterior a tope.
          </p>
          <Button asChild size="xl" variant="gold" className="shadow-xl">
            <Link href="/categorias/jardin">
              Explorar jardín <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* NEW PRODUCTS */}
      {newProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-[#fdfcfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#2a2a2a] mb-2">
                  Recién llegado
                </h2>
                <p className="text-[#a08c7a]">Las últimas incorporaciones al catálogo</p>
              </div>
              <Link
                href="/productos"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#2d4a3e] hover:text-[#1e3329] transition-colors"
              >
                Ver novedades <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-24 bg-[#f9f6f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2a2a2a] mb-3">Lo que dicen nuestros clientes</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#c9a84c] text-[#c9a84c]" />
              ))}
              <span className="ml-2 text-sm text-[#a08c7a]">4.8/5 — +1.200 reseñas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'María García',
                location: 'Madrid',
                text: 'El conjunto de ratán llegó perfectamente embalado. La calidad es excelente y el precio muy competitivo comparado con otras tiendas. Muy recomendable.',
                rating: 5,
                product: 'Conjunto Ratán 4 Plazas',
              },
              {
                name: 'Carlos Martínez',
                location: 'Barcelona',
                text: 'La mesa de roble macizo es una preciosidad. Pesa lo que tiene que pesar, la madera es sólida y el acabado perfecto. Envío rapidísimo, en 3 días.',
                rating: 5,
                product: 'Mesa Comedor Roble 180cm',
              },
              {
                name: 'Laura Sánchez',
                location: 'Valencia',
                text: 'Las butacas de terciopelo son perfectas. Muy cómodas y el color verde botella es precioso en foto pero en persona es aún mejor. Repetiré.',
                rating: 5,
                product: 'Butaca Terciopelo Verde',
              },
            ].map((review) => (
              <div
                key={review.name}
                className="bg-white rounded-2xl p-6 border border-[#e8ddd0] shadow-sm"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c9a84c] text-[#c9a84c]" />
                  ))}
                </div>
                <p className="text-[#2a2a2a] text-sm leading-relaxed mb-4 italic">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#2a2a2a]">{review.name}</p>
                    <p className="text-xs text-[#a08c7a]">{review.location}</p>
                  </div>
                  <p className="text-xs text-[#a08c7a] text-right">{review.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section className="py-16 bg-[#2a2a2a] text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ideas de decoración cada semana
          </h2>
          <p className="text-white/60 mb-8">
            Suscríbete y recibe inspiración, guías de estilo y las primeras novedades del catálogo.
          </p>
          <NewsletterForm />
          <p className="text-xs text-white/30 mt-3">Sin spam. Cancela cuando quieras.</p>
        </div>
      </section>
    </div>
  )
}
