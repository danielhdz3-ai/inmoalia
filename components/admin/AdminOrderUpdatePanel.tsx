'use client'

import { useState, useTransition } from 'react'
import { Mail } from 'lucide-react'
import type { Order } from '@/lib/supabase/types'
import type { OrderEmailTemplate } from '@/lib/resend/order-email-templates'
import { ORDER_EMAIL_TEMPLATE_OPTIONS } from '@/lib/resend/order-email-templates'

type OrderStatusOption = { value: string; label: string }

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
  const [template, setTemplate] = useState<OrderEmailTemplate>('processing')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedTemplate = ORDER_EMAIL_TEMPLATE_OPTIONS.find((t) => t.value === template)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3">
          Actualizar pedido
        </h4>
        <form action={updateOrderStatus} className="bg-white rounded-xl border border-[#e8ddd0] p-4 space-y-3">
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
              Al guardar estado <strong>Enviado</strong> con tracking, el cliente recibe un email automático (Resend).
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2d4a3e] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#1e3329] transition-colors"
          >
            Guardar cambios
          </button>
        </form>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Envío de email al cliente
        </h4>
        <form
          action={(formData) => {
            setFeedback(null)
            startTransition(async () => {
              const result = await sendOrderCustomerEmail(formData)
              setFeedback(result)
            })
          }}
          className="bg-white rounded-xl border border-[#e8ddd0] p-4 space-y-3"
        >
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Plantilla</label>
            <select
              name="email_template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as OrderEmailTemplate)}
              className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
            >
              {ORDER_EMAIL_TEMPLATE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {selectedTemplate && (
              <p className="text-[11px] text-[#a08c7a] mt-1.5 leading-snug">
                {selectedTemplate.description} Se enviará a <strong>{order.customer_email}</strong>.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[#6b5344] block mb-1.5">
              Número de seguimiento
            </label>
            <input
              name="tracking_number"
              type="text"
              defaultValue={order.tracking_number ?? ''}
              placeholder="Ej: GLS1234567890"
              className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] placeholder-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
            />
            <p className="text-[11px] text-[#a08c7a] mt-1.5 leading-snug">
              Si indicas tracking, el email lo incluirá en el texto (p. ej. «saldrá del almacén en breve, tu número de seguimiento es…»).
              Usa el guardado en el pedido si dejas el campo vacío.
            </p>
          </div>
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
            {isPending ? 'Enviando…' : 'Enviar email'}
          </button>
        </form>
      </div>
    </div>
  )
}
