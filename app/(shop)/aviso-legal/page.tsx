import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso legal — INMOALIA',
  description: 'Aviso legal e información corporativa de INMOALIA S.L.',
}

export default function AvisoLegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Aviso legal</h1>
      <p className="text-sm text-[#a08c7a] mb-10">Última actualización: enero de 2025</p>

      <div className="space-y-8 text-[#6b5344] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">1. Datos identificativos</h2>
          <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
            {[
              ['Denominación social', 'INMOALIA S.L.'],
              ['CIF', 'B-XXXXXXXX'],
              ['Domicilio social', 'España'],
              ['Actividad', 'Comercio electrónico de muebles, decoración y jardín'],
              ['Email', 'info@inmoalia.com'],
              ['Web', 'inmoalia.com'],
            ].map(([k, v]) => (
              <>
                <dt key={k} className="font-medium text-[#2a2a2a]">{k}:</dt>
                <dd key={v}>{v}</dd>
              </>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">2. Objeto y ámbito de aplicación</h2>
          <p>El presente Aviso Legal regula el acceso y uso del sitio web inmoalia.com, titularidad de INMOALIA S.L., sociedad española inscrita en el Registro Mercantil conforme a la legislación española. El acceso a este sitio web implica la aceptación plena y sin reservas de las presentes condiciones.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">3. Propiedad intelectual e industrial</h2>
          <p>Todos los contenidos del sitio web (textos, fotografías, gráficos, imágenes, logotipos, marcas, diseño gráfico, código fuente y software) son propiedad de INMOALIA S.L. o de sus licenciantes, y están protegidos por la normativa española e internacional sobre propiedad intelectual e industrial. Queda prohibida su reproducción total o parcial, distribución, comunicación pública o transformación sin autorización expresa y por escrito.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">4. Exclusión de garantías y responsabilidad</h2>
          <p>INMOALIA no garantiza la disponibilidad, continuidad o infalibilidad del sitio web y, en consecuencia, no se responsabiliza de los daños que pudieran derivarse de la falta de disponibilidad o de accesibilidad al sitio web. INMOALIA tampoco se responsabiliza de los daños causados por virus informáticos en los equipos de los usuarios durante el acceso al sitio web.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">5. Legislación aplicable y jurisdicción</h2>
          <p>La relación entre INMOALIA y los usuarios se rige por la legislación española vigente. Para la resolución de cualesquiera controversias, las partes con renuncia a cualquier otro fuero, se someten a los juzgados y tribunales del domicilio del consumidor, conforme a lo establecido en la normativa de defensa de los consumidores.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2a2a2a] mb-3">6. Contacto</h2>
          <p>Para cualquier consulta legal, puedes contactarnos en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
