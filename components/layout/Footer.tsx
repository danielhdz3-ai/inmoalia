import Link from 'next/link'
import { Globe, Mail, MessageCircle } from 'lucide-react'
import NewsletterForm from '@/components/shop/NewsletterForm'

const FOOTER_LINKS = {
  'Tienda': [
    { label: 'Novedades', href: '/productos?sort=newest' },
    { label: 'Más vendidos', href: '/productos?sort=popular' },
    { label: 'Outlet', href: '/categorias/outlet' },
    { label: 'Todas las categorías', href: '/categorias' },
  ],
  'Atención al cliente': [
    { label: 'Contacto', href: '/contacto' },
    { label: 'Seguimiento de pedido', href: '/pedidos' },
    { label: 'Devoluciones', href: '/devoluciones' },
    { label: 'Preguntas frecuentes', href: '/faq' },
  ],
  'Empresa': [
    { label: 'Sobre INMOALIA', href: '/sobre-nosotros' },
    { label: 'Blog', href: '/blog' },
    { label: 'Proveedores', href: '/proveedores' },
    { label: 'Trabaja con nosotros', href: '/empleo' },
  ],
  'Legal': [
    { label: 'Términos y condiciones', href: '/terminos' },
    { label: 'Política de privacidad', href: '/privacidad' },
    { label: 'Política de cookies', href: '/cookies' },
    { label: 'Aviso legal', href: '/aviso-legal' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#2a2a2a] text-white mt-20">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Inspírate con INMOALIA</h3>
              <p className="text-white/60 text-sm">Recibe novedades, ideas de decoración y ofertas exclusivas.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold tracking-tight">INMOALIA</span>
            <span className="text-white/40 text-xs">© {new Date().getFullYear()} INMOALIA. Todos los derechos reservados.</span>
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs mr-1">Pagos seguros:</span>
            {['VISA', 'MC', 'AMEX', 'PAYP'].map((method) => (
              <div
                key={method}
                className="bg-white/10 rounded px-2 py-1 text-[10px] font-bold text-white/60"
              >
                {method}
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/inmoalia"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              aria-label="Instagram"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="mailto:hola@inmoalia.com"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
