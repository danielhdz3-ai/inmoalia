import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, Truck, Shield, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre INMOALIA — Hogar & Jardín con alma',
  description: 'Conoce la historia de INMOALIA, nuestra misión y los valores que nos mueven.',
}

const VALUES = [
  { icon: Leaf, title: 'Sostenibilidad', desc: 'Seleccionamos proveedores comprometidos con la fabricación responsable y el uso de materiales de fuentes sostenibles.' },
  { icon: Shield, title: 'Calidad garantizada', desc: 'Cada producto pasa por un proceso de selección riguroso. Si no cumple nuestros estándares, no entra en el catálogo.' },
  { icon: Truck, title: 'Envío sin complicaciones', desc: 'Trabajamos con los mejores transportistas para que tu pedido llegue en perfectas condiciones y en el tiempo prometido.' },
  { icon: Heart, title: 'Cliente primero', desc: 'Nuestro equipo está siempre disponible para ayudarte. Tu satisfacción es nuestra razón de ser.' },
]

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#2a2a2a] mb-4">Sobre INMOALIA</h1>
        <p className="text-lg text-[#a08c7a] max-w-2xl mx-auto leading-relaxed">
          Nacimos con una idea simple: acercar el diseño de calidad al hogar de todos los españoles, sin complicaciones y con precios honestos.
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
        <div className="bg-[#f9f6f1] rounded-2xl aspect-video flex items-center justify-center border border-[#e8ddd0]">
          <span className="text-6xl font-bold text-[#e8ddd0]">INMOALIA</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#2a2a2a] mb-4">Nuestra historia</h2>
          <div className="space-y-4 text-[#6b5344] leading-relaxed">
            <p>
              INMOALIA nació de la pasión por el diseño de interiores y la convicción de que una casa bien equipada cambia la vida de las personas.
            </p>
            <p>
              Somos una tienda online especializada en muebles, iluminación, decoración y accesorios de jardín. Trabajamos con los mejores proveedores europeos para ofrecer productos de calidad a precios competitivos, con la comodidad del comercio electrónico y la confianza de un equipo humano detrás.
            </p>
            <p>
              Nuestro modelo de negocio nos permite mantener los precios ajustados sin sacrificar la calidad: trabajamos directamente con fabricantes y distribuidores, sin intermediarios innecesarios.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#2a2a2a] text-center mb-8">Nuestros valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
              <div className="w-10 h-10 rounded-xl bg-[#2d4a3e]/10 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-[#2d4a3e]" />
              </div>
              <h3 className="font-bold text-[#2a2a2a] mb-2">{v.title}</h3>
              <p className="text-sm text-[#6b5344] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-[#2d4a3e] text-white rounded-2xl p-10">
        <h2 className="text-2xl font-bold mb-3">¿Listo para transformar tu hogar?</h2>
        <p className="text-white/70 mb-6">Explora nuestra selección de más de 30 productos de calidad.</p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8972e] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </div>
  )
}
