'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { Customer, ShippingAddress } from '@/lib/supabase/types'

type AddressForm = Omit<ShippingAddress, 'full_name' | 'email'>

export default function PerfilPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState<AddressForm>({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    province: '',
    country: 'España',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: rawCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      const customer = rawCustomer as unknown as Customer | null

      setEmail(user.email ?? '')
      setFullName(customer?.full_name ?? user.user_metadata?.full_name ?? '')
      setPhone(customer?.phone ?? '')

      if (customer?.address) {
        const addr = customer.address as unknown as Partial<AddressForm>
        setAddress((prev) => ({ ...prev, ...addr }))
      }

      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      setSaving(false)
      return
    }

    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        fullName,
        phone,
        address: {
          ...address,
          phone: phone.trim() || address.phone,
        },
      }),
    })

    const data = (await res.json()) as { message?: string }

    if (!res.ok) {
      setError(data.message ?? 'No se pudieron guardar los cambios. Inténtalo de nuevo.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2d4a3e]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-sm text-[#a08c7a]">
          <Link href="/cuenta" className="hover:text-[#2d4a3e] transition-colors duration-200">
            Mi cuenta
          </Link>
          <span className="text-[#d4c4b0] mx-2 select-none" aria-hidden>
            ·
          </span>
          <span className="text-[#2a2a2a] font-medium">Datos y dirección</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a] mt-3">Datos y dirección</h1>
        <p className="text-sm text-[#a08c7a] mt-2 leading-relaxed">
          Gestiona tus datos personales y la dirección de envío habitual.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal data */}
        <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-6">
          <h2 className="font-semibold text-[#2a2a2a] text-lg mb-5">Datos personales</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-readonly">Correo electrónico</Label>
              <Input
                id="email-readonly"
                type="email"
                value={email}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                className="mt-1 bg-[#f9f6f1] text-[#6b5344] border-[#e8ddd0] rounded-lg"
              />
              <p className="text-xs text-[#a08c7a] mt-1.5">
                Lo usamos para iniciar sesión y notificarte sobre tus pedidos.
              </p>
            </div>
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-6">
          <h2 className="font-semibold text-[#2a2a2a] text-lg mb-5">Dirección de envío por defecto</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address_line1">Dirección</Label>
              <Input
                id="address_line1"
                value={address.address_line1}
                onChange={(e) => setAddress((a) => ({ ...a, address_line1: e.target.value }))}
                placeholder="Calle, número, piso..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address_line2">Información adicional (opcional)</Label>
              <Input
                id="address_line2"
                value={address.address_line2 ?? ''}
                onChange={(e) => setAddress((a) => ({ ...a, address_line2: e.target.value }))}
                placeholder="Apartamento, bloque..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Código postal</Label>
                <Input
                  id="postal_code"
                  value={address.postal_code}
                  onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                  placeholder="28001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  placeholder="Madrid"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={address.province}
                onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                placeholder="Madrid"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</> : 'Guardar cambios'}
          </Button>
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-[#27ae60] font-medium">
              <CheckCircle className="w-4 h-4" />
              ¡Cambios guardados!
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
