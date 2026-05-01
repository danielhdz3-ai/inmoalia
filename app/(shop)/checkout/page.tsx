'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Lock, Loader2 } from 'lucide-react'
import Image from 'next/image'

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

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, shippingCost, hasFreeShipping } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const subtotal = getSubtotal()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: form }),
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
      <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-8">Finalizar compra</h1>

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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="xl" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pagar {formatPrice(subtotal + shippingCost)} con Stripe
              </>
            )}
          </Button>

          <p className="text-xs text-center text-[#a08c7a]">
            Al hacer clic aceptas nuestros{' '}
            <a href="/terminos" className="underline hover:text-[#2d4a3e]">términos y condiciones</a>
            . Pago procesado de forma segura por Stripe.
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
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Envío</span>
                <span className={hasFreeShipping ? 'text-[#27ae60] font-medium' : 'text-[#2a2a2a]'}>
                  {hasFreeShipping ? 'GRATIS' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[#e8ddd0]">
                <span>Total</span>
                <span className="text-[#2d4a3e]">{formatPrice(subtotal + shippingCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
