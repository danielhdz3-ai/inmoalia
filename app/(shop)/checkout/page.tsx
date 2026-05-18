'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { getShippingCostEuros } from '@/lib/shop/shipping'
import { formatPrice } from '@/lib/utils'
import { Lock, Loader2, Tag, X, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/supabase/types'

// Evita pre-renderización estática en esta página dinámica
export const dynamic = 'force-dynamic'

// IVA 21% extraído del total (precios con IVA incluido)
const calcIva = (totalWithIva: number) => totalWithIva * 21 / 121

interface FormData {
  full_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  province: string
  country: string
}

interface Coupon {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  description: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [cartReminderConsent, setCartReminderConsent] = useState(false)
  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    province: '',
    country: 'España',
  })

  // Pre-fill form with saved profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setForm((prev) => ({ ...prev, email: user.email ?? prev.email }))

        const { data } = await supabase
          .from('customers')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .single()

        // Doble aserción: evita que el genérico de Supabase resuelva `data` como `never` en algunos builds
        const customer = data as unknown as Pick<Customer, 'full_name' | 'phone' | 'address'> | null
        if (!customer) return

        const addr = customer.address as Record<string, string> | null
        setForm((prev) => ({
          ...prev,
          full_name: customer.full_name ?? prev.full_name,
          phone: customer.phone ?? prev.phone,
          address_line1: addr?.address_line1 ?? prev.address_line1,
          address_line2: addr?.address_line2 ?? prev.address_line2,
          city: addr?.city ?? prev.city,
          postal_code: addr?.postal_code ?? prev.postal_code,
          province: addr?.province ?? prev.province,
          country: addr?.country ?? prev.country,
        }))
        setPrefilled(true)
      } catch {
        // Non-critical — proceed with empty form
      }
    }
    loadProfile()
  }, [])

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: getSubtotal() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Cupón no válido')
      setAppliedCoupon(data.coupon)
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Cupón no válido')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
  }

  const subtotal = getSubtotal()
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? subtotal * appliedCoupon.discount_value / 100
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  const shippingCostFinal = getShippingCostEuros(discountedSubtotal)
  const total = discountedSubtotal + shippingCostFinal
  const ivaAmount = calcIva(total)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      return
    }
    setLoading(true)
    setError(null)

    if (cartReminderConsent && form.email.trim()) {
      void fetch('/api/cart-reminder/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          cart: items,
          consentReminder: true,
        }),
      }).catch(() => {})
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: form,
          couponCode: appliedCoupon?.code ?? null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al procesar el pedido')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/carrito')
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-2">Finalizar compra</h1>
      {prefilled && (
        <p className="text-xs text-[#27ae60] mb-6 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Datos rellenados desde tu perfil guardado
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Datos de contacto</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nombre completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="María García López"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+34 600 000 000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Dirección de entrega</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address_line1">Dirección *</Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  required
                  value={form.address_line1}
                  onChange={handleChange}
                  placeholder="Calle Mayor, 1, 2ºA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address_line2">Piso, puerta, etc. (opcional)</Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Piso 3, puerta B"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Código postal *</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    required
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="28001"
                    className="mt-1"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Madrid"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Input
                    id="province"
                    name="province"
                    required
                    value={form.province}
                    onChange={handleChange}
                    placeholder="Madrid"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">País *</Label>
                  <Input
                    id="country"
                    name="country"
                    required
                    value={form.country}
                    onChange={handleChange}
                    placeholder="España"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cupón de descuento */}
          <div>
            <h2 className="text-lg font-semibold text-[#2a2a2a] mb-3">Cupón de descuento</h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#2d4a3e]/5 border border-[#2d4a3e]/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2d4a3e]" />
                  <span className="text-sm font-medium text-[#2d4a3e]">{appliedCoupon.code}</span>
                  <span className="text-xs text-[#6b5344]">
                    {appliedCoupon.discount_type === 'percentage'
                      ? `−${appliedCoupon.discount_value}%`
                      : `−${formatPrice(appliedCoupon.discount_value)}`}
                  </span>
                  {appliedCoupon.description && (
                    <span className="text-xs text-[#a08c7a]">· {appliedCoupon.description}</span>
                  )}
                </div>
                <button onClick={removeCoupon} className="text-[#a08c7a] hover:text-[#c0392b] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a08c7a]" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="CÓDIGO"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#e8ddd0] text-sm text-[#2a2a2a] placeholder:text-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 h-10 rounded-lg border border-[#e8ddd0] text-sm font-medium text-[#2a2a2a] hover:bg-[#f9f6f1] disabled:opacity-50 transition-colors"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-xs text-[#c0392b] mt-1.5">{couponError}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Checkbox de términos — aceptación explícita obligatoria */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                if (e.target.checked) setError(null)
              }}
              className="mt-0.5 w-4 h-4 rounded border-[#a08c7a] text-[#2d4a3e] accent-[#2d4a3e] cursor-pointer shrink-0"
            />
            <span className="text-xs text-[#6b5344] leading-relaxed group-hover:text-[#2a2a2a] transition-colors">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="underline hover:text-[#2d4a3e]">
                términos y condiciones
              </Link>
              {' '}y la{' '}
              <Link href="/privacidad" target="_blank" className="underline hover:text-[#2d4a3e]">
                política de privacidad
              </Link>
              . Entiendo que mi pedido implica una obligación de pago. *
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={cartReminderConsent}
              onChange={(e) => setCartReminderConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#a08c7a] text-[#2d4a3e] accent-[#2d4a3e] cursor-pointer shrink-0"
            />
            <span className="text-xs text-[#6b5344] leading-relaxed group-hover:text-[#2a2a2a] transition-colors">
              Sí, quiero recibir como máximo un recordatorio si abandono la compra; guardáis mi carrito para enviarme un enlace de recuperación. Base legal:{' '}
              <Link href="/privacidad" target="_blank" className="underline hover:text-[#2d4a3e]">
                consentimiento
              </Link>
              .
            </span>
          </label>

          <Button
            type="submit"
            size="xl"
            className="w-full gap-2"
            disabled={loading || !termsAccepted}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pagar {formatPrice(total)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-[#a08c7a]">
            Pago procesado de forma segura por Stripe. Tus datos nunca se almacenan en nuestros servidores.
          </p>
        </form>

        {/* Order summary */}
        <div>
          <div className="bg-[#f9f6f1] border border-[#e8ddd0] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#2a2a2a] mb-5">Resumen del pedido</h2>

            <div className="space-y-4 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#e8ddd0] shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    <span className="absolute -top-1 -right-1 bg-[#2d4a3e] text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px] font-bold px-1">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2a2a2a] line-clamp-2">{item.name}</p>
                    <p className="text-sm text-[#2d4a3e] font-semibold mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8ddd0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Subtotal</span>
                <span className="text-[#2a2a2a]">{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-[#27ae60] font-medium">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Envío</span>
                <span className={shippingCostFinal === 0 ? 'text-[#27ae60] font-medium' : 'text-[#2a2a2a]'}>
                  {shippingCostFinal === 0 ? 'GRATIS' : formatPrice(shippingCostFinal)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#a08c7a] pt-1">
                <span>IVA 21% (incluido)</span>
                <span>{formatPrice(ivaAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[#e8ddd0]">
                <span>Total</span>
                <span className="text-[#2d4a3e]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
