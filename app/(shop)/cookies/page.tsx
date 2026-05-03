import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de cookies — INMOALIA',
  description: 'Información sobre el uso de cookies en INMOALIA.',
}

const COOKIES = [
  { nombre: 'inmoalia-cart', tipo: 'Técnica', finalidad: 'Almacena los artículos del carrito de compra en tu navegador.', duracion: 'Persistente (localStorage)', tercero: 'No' },
  { nombre: 'inmoalia-favorites', tipo: 'Técnica', finalidad: 'Almacena tus productos favoritos.', duracion: 'Persistente (localStorage)', tercero: 'No' },
  { nombre: 'sb-*', tipo: 'Técnica', finalidad: 'Cookies de sesión de Supabase Auth para mantenerte conectado.', duracion: 'Sesión / 1 semana', tercero: 'Supabase Inc.' },
  { nombre: '_stripe_*', tipo: 'Técnica', finalidad: 'Cookies de Stripe para el procesamiento seguro de pagos y prevención de fraude.', duracion: 'Sesión', tercero: 'Stripe Inc.' },
]

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Política de cookies</h1>
      <p className="text-sm text-[#a08c7a] mb-10">Última actualización: enero de 2025</p>

      <div className="space-y-8 text-[#6b5344] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu navegador para recordar información entre visitas. No contienen información personal sensible y no pueden ejecutar programas ni instalar virus.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">Cookies que utilizamos</h2>
          <p className="mb-4">INMOALIA solo utiliza cookies estrictamente necesarias para el funcionamiento del sitio. No utilizamos cookies publicitarias ni de rastreo de terceros.</p>

          <div className="overflow-x-auto rounded-xl border border-[#e8ddd0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f9f6f1] border-b border-[#e8ddd0]">
                  {['Cookie', 'Tipo', 'Finalidad', 'Duración', 'Tercero'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-[#2a2a2a] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ddd0]">
                {COOKIES.map((c) => (
                  <tr key={c.nombre} className="bg-white">
                    <td className="px-4 py-3 font-mono text-xs text-[#2d4a3e]">{c.nombre}</td>
                    <td className="px-4 py-3">{c.tipo}</td>
                    <td className="px-4 py-3">{c.finalidad}</td>
                    <td className="px-4 py-3 text-xs">{c.duracion}</td>
                    <td className="px-4 py-3 text-xs">{c.tercero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">Cómo gestionar las cookies</h2>
          <p className="mb-3">Puedes configurar tu navegador para rechazar o eliminar las cookies en cualquier momento. Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento de la tienda (carrito, sesión).</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-[#2d4a3e] underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies" className="text-[#2d4a3e] underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" className="text-[#2d4a3e] underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">Cambios en esta política</h2>
          <p>Podemos actualizar esta política cuando sea necesario. Te informaremos de cambios significativos a través de nuestra web. Puedes contactarnos en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
