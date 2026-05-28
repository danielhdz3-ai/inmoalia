import type { Metadata } from 'next'
import Link from 'next/link'
import { RotateCcw, CheckCircle, Clock, Mail } from 'lucide-react'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Devoluciones — INMOALIA',
  'Política de devoluciones de INMOALIA. 30 días para devolver tu compra sin preguntas.',
  '/devoluciones',
)

const STEPS = [
  { step: '01', title: 'Contáctanos', desc: 'Escríbenos a info@inmoalia.com indicando tu número de pedido y el motivo de la devolución. Te responderemos en menos de 24 horas.' },
  { step: '02', title: 'Prepara el paquete', desc: 'Embala el producto en su embalaje original o uno equivalente. Asegúrate de que el artículo esté en perfectas condiciones y sin usar.' },
  { step: '03', title: 'Envía el paquete', desc: 'Te indicaremos la dirección de devolución. El coste de envío corre a tu cargo salvo en caso de producto defectuoso o error nuestro.' },
  { step: '04', title: 'Reembolso', desc: 'Una vez recibido y verificado el producto, procesamos el reembolso completo en 5-7 días laborables al método de pago original.' },
]

export default function DevolucionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d4a3e]/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-[#2d4a3e]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2a2a2a]">Devoluciones</h1>
        </div>
        <p className="text-[#a08c7a]">Tu satisfacción es nuestra prioridad. Tienes 30 días para devolver cualquier producto.</p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: CheckCircle, title: '30 días', desc: 'Para devolver sin justificación' },
          { icon: Clock, title: '5-7 días', desc: 'Para recibir el reembolso' },
          { icon: Mail, title: 'Sin complicaciones', desc: 'Proceso sencillo por email' },
        ].map((item) => (
          <div key={item.title} className="bg-[#f9f6f1] rounded-2xl border border-[#e8ddd0] p-5 text-center">
            <item.icon className="w-6 h-6 text-[#2d4a3e] mx-auto mb-2" />
            <p className="font-bold text-[#2a2a2a]">{item.title}</p>
            <p className="text-xs text-[#a08c7a] mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <h2 className="text-xl font-bold text-[#2a2a2a] mb-6">Cómo hacer una devolución</h2>
      <div className="space-y-4 mb-10">
        {STEPS.map((s) => (
          <div key={s.step} className="bg-white rounded-2xl border border-[#e8ddd0] p-5 flex gap-4">
            <span className="text-2xl font-bold text-[#2d4a3e]/20 shrink-0">{s.step}</span>
            <div>
              <h3 className="font-semibold text-[#2a2a2a] mb-1">{s.title}</h3>
              <p className="text-sm text-[#6b5344] leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6 mb-8">
        <h2 className="font-bold text-[#2a2a2a] mb-4">Condiciones de devolución</h2>
        <ul className="space-y-2 text-sm text-[#6b5344]">
          {[
            'El producto debe devolverse en un plazo máximo de 30 días naturales desde la recepción.',
            'El artículo debe estar sin usar, en su estado original y con el embalaje intacto.',
            'Los productos personalizados o a medida no son elegibles para devolución.',
            'Los productos defectuosos o con error de envío se recogen sin coste para ti.',
            'El reembolso se realiza al mismo método de pago utilizado en la compra.',
          ].map((c) => (
            <li key={c} className="flex items-start gap-2">
              <span className="text-[#2d4a3e] mt-1">◆</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          Iniciar devolución
        </Link>
      </div>
    </div>
  )
}
