import type { Metadata } from 'next'
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto — INMOALIA',
  description: 'Contacta con el equipo de INMOALIA. Estamos para ayudarte con cualquier consulta sobre productos y pedidos.',
}

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Contacto</h1>
        <p className="text-[#a08c7a]">Estamos aquí para ayudarte. Escríbenos y te responderemos en menos de 24 horas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: Mail,
            title: 'Email',
            desc: 'Para consultas generales, pedidos y devoluciones',
            value: 'info@inmoalia.com',
            href: 'mailto:info@inmoalia.com',
          },
          {
            icon: MessageCircle,
            title: 'WhatsApp',
            desc: 'Respuesta rápida en horario de atención',
            value: '+34 600 000 000',
            href: 'https://wa.me/34600000000',
          },
          {
            icon: Clock,
            title: 'Horario de atención',
            desc: 'Lunes a viernes',
            value: '9:00 – 18:00 h',
            href: null,
          },
          {
            icon: MapPin,
            title: 'Empresa',
            desc: 'INMOALIA S.L. — España',
            value: 'CIF: B54560943',
            href: null,
          },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2d4a3e]/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#2d4a3e]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2a2a2a]">{item.title}</h3>
                <p className="text-sm text-[#a08c7a] mt-0.5">{item.desc}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium text-[#2d4a3e] hover:underline mt-1 block">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-[#2a2a2a] mt-1">{item.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f9f6f1] border border-[#e8ddd0] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#2a2a2a] mb-2">¿Tienes una consulta urgente?</h2>
        <p className="text-[#6b5344] text-sm mb-4">
          Para incidencias con pedidos en curso, incluye tu número de pedido (INM-XXXX-XXXXXX) en el asunto.
        </p>
        <a
          href="mailto:info@inmoalia.com"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          Escribir email
        </a>
      </div>
    </div>
  )
}
