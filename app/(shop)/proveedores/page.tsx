import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Proveedores — INMOALIA',
  description: 'Información sobre los proveedores de INMOALIA y nuestro proceso de selección.',
}

export default function ProveedoresPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Nuestros proveedores</h1>
        <p className="text-[#a08c7a]">La calidad de nuestros productos empieza por la elección de los mejores socios.</p>
      </div>

      <div className="space-y-6 mb-12">
        {[
          {
            name: 'dropXL (vidaXL)',
            tag: 'Proveedor principal',
            desc: 'Especializado en muebles de jardín, hogar y accesorios de gran volumen. Líder europeo en e-commerce de muebles con más de 15 años de experiencia y presencia en 30 países.',
            strengths: ['Gran variedad de producto', 'Precios muy competitivos', 'Stock permanente', 'Envío desde almacenes europeos'],
          },
          {
            name: 'Droppery',
            tag: 'Proveedor premium',
            desc: 'Proveedor boutique especializado en productos de diseño y calidad superior. Selección cuidadosa de artículos únicos fabricados por pequeños productores europeos.',
            strengths: ['Diseño exclusivo', 'Materiales premium', 'Producción artesanal', 'Sostenibilidad certificada'],
          },
        ].map((p) => (
          <div key={p.name} className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#2a2a2a]">{p.name}</h2>
                <span className="text-xs font-medium text-[#2d4a3e] bg-[#2d4a3e]/10 px-2.5 py-1 rounded-full">{p.tag}</span>
              </div>
              <Package className="w-8 h-8 text-[#e8ddd0] shrink-0" />
            </div>
            <p className="text-sm text-[#6b5344] leading-relaxed mb-4">{p.desc}</p>
            <ul className="space-y-1.5">
              {p.strengths.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-[#6b5344]">
                  <CheckCircle className="w-4 h-4 text-[#27ae60] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-[#f9f6f1] rounded-2xl border border-[#e8ddd0] p-6 text-center">
        <h2 className="font-bold text-[#2a2a2a] mb-2">¿Eres proveedor?</h2>
        <p className="text-sm text-[#a08c7a] mb-4">Si tienes productos de calidad que encajan con nuestra filosofía, nos encantaría conocerte.</p>
        <Link href="/contacto" className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-2.5 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium">
          Contactar
        </Link>
      </div>
    </div>
  )
}
