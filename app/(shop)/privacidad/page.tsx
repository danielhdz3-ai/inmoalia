import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad — INMOALIA',
  description: 'Información sobre cómo INMOALIA trata y protege tus datos personales.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Política de privacidad</h1>
      <p className="text-sm text-[#a08c7a] mb-10">Última actualización: enero de 2025</p>

      <div className="space-y-8 text-[#6b5344] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">1. Responsable del tratamiento</h2>
          <p>INMOALIA S.L., con CIF B-XXXXXXXX y domicilio social en España, es la responsable del tratamiento de los datos personales recabados a través de este sitio web. Puedes contactarnos en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">2. Datos que recogemos</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Datos de registro: nombre, email y contraseña (cifrada).</li>
            <li>Datos de envío: nombre completo, dirección, teléfono y provincia.</li>
            <li>Datos de pago: procesados íntegramente por Stripe. INMOALIA no almacena datos de tarjeta.</li>
            <li>Datos de navegación: cookies técnicas y analíticas (ver Política de cookies).</li>
            <li>Comunicaciones: emails de contacto o soporte que nos envíes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">3. Finalidades y base jurídica</h2>
          <ul className="space-y-2">
            {[
              ['Gestionar tu cuenta y pedidos', 'Ejecución del contrato (art. 6.1.b RGPD)'],
              ['Enviarte confirmaciones y actualizaciones de pedido', 'Ejecución del contrato'],
              ['Enviarte comunicaciones comerciales (newsletter)', 'Consentimiento (art. 6.1.a RGPD). Puedes darte de baja en cualquier momento.'],
              ['Mejorar el servicio y detectar fraudes', 'Interés legítimo (art. 6.1.f RGPD)'],
              ['Cumplir obligaciones legales (fiscales, etc.)', 'Obligación legal (art. 6.1.c RGPD)'],
            ].map(([finalidad, base]) => (
              <li key={finalidad} className="flex gap-3 text-sm">
                <span className="text-[#2d4a3e] mt-1">◆</span>
                <span><strong className="text-[#2a2a2a]">{finalidad}:</strong> {base}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">4. Destinatarios</h2>
          <p className="mb-2">Tus datos pueden ser comunicados a:</p>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li><strong>Supabase Inc.</strong> — gestión de base de datos y autenticación (USA, con cláusulas contractuales estándar).</li>
            <li><strong>Stripe Inc.</strong> — procesamiento de pagos (USA, Privacy Shield/SCC).</li>
            <li><strong>Resend Inc.</strong> — envío de emails transaccionales.</li>
            <li><strong>Proveedores logísticos</strong> — necesarios para la entrega de tu pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">5. Conservación de datos</h2>
          <p>Conservamos tus datos mientras mantengas una cuenta activa o durante el tiempo necesario para cumplir con nuestras obligaciones legales (mínimo 5 años para datos fiscales).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">6. Tus derechos</h2>
          <p className="mb-3">Puedes ejercer los siguientes derechos escribiéndonos a <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Acceso a tus datos personales.</li>
            <li>Rectificación de datos inexactos.</li>
            <li>Supresión ("derecho al olvido").</li>
            <li>Oposición al tratamiento.</li>
            <li>Portabilidad en formato estructurado.</li>
            <li>Limitación del tratamiento.</li>
          </ul>
          <p className="mt-3">También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en <a href="https://www.aepd.es" className="text-[#2d4a3e] underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</p>
        </section>
      </div>
    </div>
  )
}
