import { CreditCard, MapPin, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Order, ShippingAddress } from '@/lib/supabase/types'

function formatCountry(country: string | undefined): string {
  if (!country?.trim()) return 'España'
  const c = country.trim()
  if (c === 'ES' || c.toLowerCase() === 'es') return 'España'
  return c
}

export default function AdminOrderCustomerPanel({ order }: { order: Order }) {
  const address = order.shipping_address as unknown as ShippingAddress
  const hasShipping = Boolean(
    address?.full_name?.trim() ||
      address?.address_line1?.trim() ||
      address?.city?.trim(),
  )

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Cliente
        </h4>
        <div className="bg-white rounded-xl border border-[#e8ddd0] p-4 text-sm space-y-1">
          {address?.full_name?.trim() ? (
            <p className="font-semibold text-[#2a2a2a]">{address.full_name}</p>
          ) : (
            <p className="text-[#c0392b] text-xs">Nombre no registrado</p>
          )}
          <p className="text-[#6b5344]">{order.customer_email}</p>
          {address?.phone?.trim() ? (
            <p className="text-[#6b5344]">
              <a href={`tel:${address.phone.replace(/\s/g, '')}`} className="hover:text-[#2d4a3e]">
                {address.phone}
              </a>
            </p>
          ) : (
            <p className="text-[#a08c7a] text-xs">Teléfono no registrado</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Dirección de envío
        </h4>
        <div className="bg-white rounded-xl border border-[#e8ddd0] p-4 text-sm text-[#6b5344] space-y-0.5">
          {hasShipping ? (
            <>
              {address.address_line1 && <p>{address.address_line1}</p>}
              {address.address_line2?.trim() && <p>{address.address_line2}</p>}
              <p>
                {[address.postal_code, address.city].filter(Boolean).join(' ')}
              </p>
              {address.province?.trim() && <p>{address.province}</p>}
              <p>{formatCountry(address.country)}</p>
            </>
          ) : (
            <p className="text-[#c0392b] text-xs">
              Sin dirección guardada. Revisa el email de confirmación o Stripe Dashboard.
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          Pago
        </h4>
        <div className="bg-white rounded-xl border border-[#e8ddd0] p-4 text-sm space-y-2">
          <div className="flex justify-between text-[#6b5344]">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#6b5344]">
            <span>Envío</span>
            <span>{order.shipping_cost === 0 ? 'Gratis' : formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#2a2a2a] pt-2 border-t border-[#e8ddd0]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          {order.stripe_payment_id && (
            <p className="text-[10px] text-[#a08c7a] pt-1 break-all">
              Stripe: {order.stripe_payment_id}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
