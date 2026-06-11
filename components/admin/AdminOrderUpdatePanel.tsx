'use client'

import { useState, useTransition } from 'react'
import { Mail, Save } from 'lucide-react'
import type { Order } from '@/lib/supabase/types'
import type { ManualOrderEmailType } from '@/lib/resend/emails'

type OrderStatusOption = { value: string; label: string }

const EMAIL_TYPES: { value: ManualOrderEmailType; label: string }[] = [
  { value: 'confirmation', label: 'Confirmación de pedido' },
  { value: 'paid', label: 'Pago confirmado' },
  { value: 'processing', label: 'En preparación' },
  { value: 'shipped', label: 'Enviado — en camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Pedido cancelado' },
]

type Tab = 'update' | 'email'

type Props = {
  order: Order
  orderStatuses: OrderStatusOption[]
  updateOrderStatus: (formData: FormData) => Promise<void>
  sendOrderCustomerEmail: (formData: FormData) => Promise<{ ok: boolean; message: string }>
}

export default function AdminOrderUpdatePanel({
  order,
  orderStatuses,
  updateOrderStatus,
  sendOrderCustomerEmail,
}: Props) {
  const [tab, setTab] = useState<Tab>('update')
  const [emailType, setEmailType] = useState<ManualOrderEmailType>('processing')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3">
        Actualizar pedido
      </h4>
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
        <div className="flex border-b border-[#e8ddd0]">
          <button
            type="button"
            onClick={() => { setTab('update'); setFeedback(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'update'
                ? 'bg-[#f9f6f1] text-[#2d4a3e] border-b-2 border-[#2d4a3e]'
                : 'text-[#a08c7a] hover:text-[#6b5344] hover:bg-[#fdfcfa]'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Guardar
          </button>
          <button
            type="button"
            onClick={() => { setTab('email'); setFeedback(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === 'email'
                ? 'bg-[#f9f6f1] text-[#2d4a3e] border-b-2 border-[#2d4a3e]'
                : 'text-[#a08c7a] hover:text-[#6b5344] hover:bg-[#fdfcfa]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Enviar email
          </button>
        </div>

        <div className="p-4">
          {tab === 'update' ? (
            <form action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Estado</label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                >
                  {orderStatuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Número de seguimiento</label>
                <input
                  name="tracking_number"
                  type="text"
                  defaultValue={order.tracking_number ?? ''}
                  placeholder="Ej: GLS1234567890"
                  className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] placeholder-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                />
                <p className="text-[11px] text-[#a08c7a] mt-1.5 leading-snug">
                  Al guardar estado <strong>Enviado</strong> con un número de tracking, el cliente recibe automáticamente un email si Resend está configurado.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2d4a3e] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#1e3329] transition-colors"
              >
                Guardar cambios
              </button>
            </form>
          ) : (
            <form
              action={(formData) => {
                setFeedback(null)
                startTransition(async () => {
                  const result = await sendOrderCustomerEmail(formData)
                  setFeedback(result)
                })
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Tipo de email</label>
                <select
                  name="email_type"
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value as ManualOrderEmailType)}
                  className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                >
                  {EMAIL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#a08c7a] mt-1.5 leading-snug">
                  Se enviará a <strong>{order.customer_email}</strong> vía Resend. No modifica el estado del pedido.
                </p>
              </div>
              {emailType === 'shipped' && (
                <div>
                  <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Número de seguimiento</label>
                  <input
                    name="tracking_number"
                    type="text"
                    defaultValue={order.tracking_number ?? ''}
                    placeholder="Ej: GLS1234567890"
                    className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] placeholder-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                  />
                </div>
              )}
              {feedback && (
                <p
                  className={`text-xs rounded-lg px-3 py-2 ${
                    feedback.ok
                      ? 'bg-[#27ae60]/10 text-[#1e7e34]'
                      : 'bg-[#c0392b]/10 text-[#c0392b]'
                  }`}
                >
                  {feedback.message}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#2980b9] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#2471a3] transition-colors disabled:opacity-60"
              >
                {isPending ? 'Enviando…' : 'Enviar email al cliente'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
