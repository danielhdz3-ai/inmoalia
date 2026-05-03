import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'info@inmoalia.com'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID

    // Si hay audience configurada, añadir como contacto
    if (audienceId) {
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      })
    }

    // Enviar email de bienvenida al suscriptor
    await resend.emails.send({
      from: `INMOALIA <${FROM}>`,
      to: email,
      subject: '¡Bienvenido a INMOALIA! Ya eres parte de nuestra comunidad',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #2a2a2a; letter-spacing: -0.5px; margin: 0;">INMOALIA</h1>
            <p style="color: #a08c7a; font-size: 13px; margin: 4px 0 0; letter-spacing: 0.2em; text-transform: uppercase;">Hogar & Jardín</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e8ddd0; text-align: center;">
            <div style="width: 64px; height: 64px; background: #2d4a3e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
              <span style="color: #c9a84c; font-size: 28px;">✓</span>
            </div>

            <h2 style="color: #2a2a2a; font-size: 22px; font-weight: 700; margin: 0 0 12px;">¡Ya eres parte de INMOALIA!</h2>
            <p style="color: #6b5344; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              A partir de ahora recibirás en exclusiva:
            </p>

            <div style="text-align: left; margin-bottom: 28px;">
              ${['Nuevas colecciones y productos antes que nadie', 'Ofertas y descuentos exclusivos para suscriptores', 'Inspiración y consejos de decoración', 'Liquidaciones y acceso prioritario al outlet'].map(item => `
                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                  <span style="color: #2d4a3e; font-size: 16px; margin-top: 2px;">◆</span>
                  <span style="color: #6b5344; font-size: 14px; line-height: 1.5;">${item}</span>
                </div>
              `).join('')}
            </div>

            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'}/productos"
              style="display: inline-block; background: #2d4a3e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Explorar productos →
            </a>
          </div>

          <p style="text-align: center; color: #a08c7a; font-size: 12px; margin-top: 24px; line-height: 1.6;">
            © 2024 INMOALIA — 
            <a href="mailto:info@inmoalia.com" style="color: #2d4a3e; text-decoration: none;">info@inmoalia.com</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter subscription error:', err)
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  }
}
