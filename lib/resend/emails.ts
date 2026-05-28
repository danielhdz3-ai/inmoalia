import { Resend } from 'resend'
import type { Order, OrderItem, ShippingAddress } from '@/lib/supabase/types'
import { isResendConfigured } from '@/lib/resend/config'
import { absoluteUrl } from '@/lib/site'

let resendInstance: Resend | null = null

function getResendInstance(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || '')
  }
  return resendInstance
}

const FROM = process.env.RESEND_FROM_EMAIL || 'info@inmoalia.com'

/** Recuperación de contraseña: plantilla y envío vía Supabase Auth (no Resend salvo que lo personalicéis en el panel de Supabase). */

export type WelcomeAccountParams = {
  to: string
  name: string
}

/** Bienvenida tras verificar el email (callback de auth). Desde INMOALIA vía Resend. */
export async function sendWelcomeAccountEmail({ to, name }: WelcomeAccountParams) {
  if (!isResendConfigured()) {
    console.warn('[RESEND] API key no configurada, email de bienvenida no enviado')
    return { success: false, error: 'API key no configurada' }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
  const firstName = name.trim() || 'Cliente'

  try {
    const result = await getResendInstance().emails.send({
      from: `INMOALIA <${FROM}>`,
      to,
      subject: 'Bienvenido a INMOALIA — tu cuenta ya está activa',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #2a2a2a; letter-spacing: -0.5px; margin: 0;">INMOALIA</h1>
            <p style="color: #a08c7a; font-size: 13px; margin: 4px 0 0;">Hogar & Jardín</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e8ddd0;">
            <h2 style="color: #2a2a2a; font-size: 20px; margin: 0 0 12px;">Hola, ${escapeHtml(firstName)}</h2>
            <p style="color: #6b5344; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
              Gracias por unirte a INMOALIA. Tu cuenta ya está activa: puedes explorar el catálogo, guardar favoritos y realizar pedidos con total seguridad.
            </p>
            <p style="color: #6b5344; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
              Si tienes cualquier duda, escríbenos a <a href="mailto:info@inmoalia.com" style="color: #2d4a3e;">info@inmoalia.com</a>.
            </p>
            <div style="text-align: center;">
              <a href="${site}/productos" style="display: inline-block; background: #2d4a3e; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Ver productos</a>
            </div>
          </div>
          <p style="text-align: center; color: #a08c7a; font-size: 12px; margin-top: 24px;">
            © INMOALIA — inmoalia.com · Este mensaje lo envía el equipo de INMOALIA.
          </p>
        </div>
      `,
    })

    console.log('[RESEND] Email de bienvenida enviado:', { to, id: result.data?.id })
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('[RESEND] Error al enviar email de bienvenida:', error)
    return { success: false, error: String(error) }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function emailProductImageUrl(image: string | undefined): string | null {
  if (!image?.trim()) return null
  const trimmed = image.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('/')) return absoluteUrl(trimmed)
  return null
}

function buildOrderItemsRowsHtml(items: OrderItem[]): string {
  return items
    .map((item) => {
      const img = emailProductImageUrl(item.image)
      const lineTotal = formatPrice(item.price * item.quantity)
      const imgCell = img
        ? `<td width="56" valign="top" style="padding:14px 12px 14px 0;border-bottom:1px solid #e8ddd0;">
            <img src="${escapeHtml(img)}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #e8ddd0;" />
          </td>`
        : `<td width="56" style="padding:14px 12px 14px 0;border-bottom:1px solid #e8ddd0;"></td>`

      return `
        <tr>
          ${imgCell}
          <td valign="top" style="padding:14px 0;border-bottom:1px solid #e8ddd0;color:#2a2a2a;font-size:14px;line-height:1.45;">
            <strong style="font-weight:600;">${escapeHtml(item.name)}</strong><br />
            <span style="color:#a08c7a;font-size:13px;">Cantidad: ${item.quantity}</span>
          </td>
          <td valign="top" align="right" style="padding:14px 0 14px 12px;border-bottom:1px solid #e8ddd0;color:#2a2a2a;font-size:14px;font-weight:600;white-space:nowrap;">
            ${lineTotal}
          </td>
        </tr>`
    })
    .join('')
}

function buildOrderConfirmationHtml(order: Order): string {
  const items = order.items as unknown as OrderItem[]
  const address = order.shipping_address as unknown as ShippingAddress
  const site = absoluteUrl('/').replace(/\/$/, '')
  const firstName = escapeHtml(address.full_name?.trim().split(/\s+/)[0] || 'Cliente')
  const shippingLabel =
    order.shipping_cost === 0 ? 'GRATIS' : formatPrice(order.shipping_cost)
  const shippingColor = order.shipping_cost === 0 ? '#27ae60' : '#2a2a2a'

  const addressLines = [
    address.full_name,
    address.address_line1,
    address.address_line2,
    [address.postal_code, address.city].filter(Boolean).join(' '),
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join('<br />')

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3efe8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Cabecera -->
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:#2a2a2a;letter-spacing:-0.5px;">INMOALIA</p>
              <p style="margin:6px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#a08c7a;">Hogar &amp; Jardín</p>
            </td>
          </tr>

          <!-- Tarjeta principal -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e8ddd0;border-radius:16px;padding:32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- Badge pedido -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#2d4a3e;border-radius:12px;">
                      <tr>
                        <td style="padding:18px 32px;text-align:center;">
                          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Pedido confirmado</p>
                          <p style="margin:6px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:22px;font-weight:700;color:#ffffff;">${escapeHtml(order.order_number)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2a2a2a;font-size:16px;font-weight:600;padding-bottom:8px;">
                    Hola, ${firstName}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#6b5344;font-size:15px;line-height:1.65;padding-bottom:28px;">
                    Hemos recibido tu pago y ya estamos preparando tu pedido. Te avisaremos por email cuando salga de almacén.
                  </td>
                </tr>

                <!-- Productos -->
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2a2a2a;font-size:15px;font-weight:600;padding-bottom:12px;border-bottom:2px solid #e8ddd0;">
                    Resumen del pedido
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${buildOrderItemsRowsHtml(items)}
                    </table>
                  </td>
                </tr>

                <!-- Totales -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f1;border-radius:10px;">
                      <tr>
                        <td style="padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#a08c7a;">Subtotal</td>
                        <td align="right" style="padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#2a2a2a;">${formatPrice(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding:0 16px 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#a08c7a;">Envío</td>
                        <td align="right" style="padding:0 16px 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:${shippingColor};font-weight:600;">${shippingLabel}</td>
                      </tr>
                      <tr>
                        <td style="border-top:1px solid #e8ddd0;padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:700;color:#2a2a2a;">Total</td>
                        <td align="right" style="border-top:1px solid #e8ddd0;padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:20px;font-weight:700;color:#2d4a3e;">${formatPrice(order.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Dirección -->
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2a2a2a;font-size:15px;font-weight:600;padding-bottom:10px;">
                    Dirección de entrega
                  </td>
                </tr>
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#6b5344;font-size:14px;line-height:1.65;padding-bottom:24px;">
                    ${addressLines}
                  </td>
                </tr>

                <!-- Próximos pasos -->
                <tr>
                  <td style="background:#eef6f1;border-left:4px solid #2d4a3e;border-radius:0 10px 10px 0;padding:18px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#2a2a2a;">¿Qué pasa ahora?</p>
                    <p style="margin:0;font-size:13px;line-height:1.7;color:#6b5344;">
                      1. Preparamos tu pedido (24–48 h laborables)<br />
                      2. Recibirás el número de seguimiento al enviarlo<br />
                      3. Entrega estimada: 2–5 días laborables en España
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding:28px 0 8px;">
                    <a href="${site}/pedidos" style="display:inline-block;background:#2d4a3e;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
                      Ver mis pedidos
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.6;color:#a08c7a;padding-top:8px;">
                    ¿Dudas? Escríbenos a <a href="mailto:info@inmoalia.com" style="color:#2d4a3e;">info@inmoalia.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding:24px 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.6;color:#a08c7a;">
              © ${new Date().getFullYear()} INMOALIA · <a href="${site}" style="color:#2d4a3e;text-decoration:none;">inmoalia.com</a><br />
              <a href="${site}/devoluciones" style="color:#a08c7a;">Política de devoluciones</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmation(order: Order) {
  if (!isResendConfigured()) return

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to: order.customer_email,
    subject: `Pedido confirmado #${order.order_number} — INMOALIA`,
    html: buildOrderConfirmationHtml(order),
  })
}

export async function sendShippingNotification(
  order: Order,
  trackingNumber: string,
  trackingUrl?: string
) {
  if (!isResendConfigured()) return

  const address = order.shipping_address as unknown as ShippingAddress
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to: order.customer_email,
    subject: `Tu pedido #${order.order_number} está en camino 🚚`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #2a2a2a; letter-spacing: -0.5px; margin: 0;">INMOALIA</h1>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e8ddd0;">
          <h2 style="color: #2a2a2a; font-size: 22px; margin: 0 0 8px;">¡Tu pedido está en camino!</h2>
          <p style="color: #6b5344; font-size: 15px; margin: 0 0 24px;">Pedido ${order.order_number}</p>
          
          <div style="background: #f9f6f1; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <p style="color: #a08c7a; font-size: 13px; margin: 0 0 4px;">Número de seguimiento</p>
            <p style="color: #2a2a2a; font-size: 18px; font-weight: 700; margin: 0;">${trackingNumber}</p>
            ${trackingUrl ? `<a href="${trackingUrl}" style="color: #2d4a3e; font-size: 14px; text-decoration: none; display: inline-block; margin-top: 8px;">Rastrear envío →</a>` : ''}
          </div>
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #2a2a2a; font-size: 15px; margin: 0 0 12px;">
              📦 Consejos para la recepción
            </h3>
            <ul style="color: #6b5344; font-size: 13px; line-height: 1.7; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Revisa el paquete al recibirlo. Si observas daños, comunícalo al transportista.</li>
              <li style="margin-bottom: 8px;">Dispones de 48 horas para reportar cualquier incidencia a <a href="mailto:info@inmoalia.com" style="color: #2196f3; text-decoration: underline;">info@inmoalia.com</a>.</li>
              <li style="margin-bottom: 0;">Conserva el embalaje original para posibles devoluciones.</li>
            </ul>
          </div>
          
          <p style="color: #6b5344; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Hola ${address.full_name}, tu pedido está en camino. 
            El tiempo estimado de entrega es de 2-5 días laborables.
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.65; margin: 0;">
            Para devoluciones o incidencias, consulta <a href="${site}/devoluciones" style="color: #2d4a3e;">devoluciones</a> y tu historial en <a href="${site}/pedidos" style="color: #2d4a3e;">Mis pedidos</a>.
          </p>
        </div>
      </div>
    `,
  })
}

/** Reembolso vía Stripe (total o parcial). No marca el pedido — solo comunicación. */
export async function sendOrderRefundNotice(order: Order, refundedAmountEUR: number, isFullRefund: boolean) {
  if (!isResendConfigured()) return

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
  const address = order.shipping_address as unknown as ShippingAddress
  const who = escapeHtml(address.full_name?.trim() || order.customer_email)

  const headline = isFullRefund
    ? 'Reembolso completado'
    : 'Actualización sobre tu reembolso'

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to: order.customer_email,
    subject: isFullRefund
      ? `Reembolso procesado — pedido ${order.order_number}`
      : `Reembolso parcial — pedido ${order.order_number}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #2a2a2a; margin: 0;">INMOALIA</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; border: 1px solid #e8ddd0;">
          <h2 style="color: #2a2a2a; font-size: 20px; margin: 0 0 12px;">${headline}</h2>
          <p style="color: #6b5344; font-size: 15px; line-height: 1.65; margin: 0 0 16px;">
            Hola ${who},
          </p>
          <p style="color: #6b5344; font-size: 15px; line-height: 1.65; margin: 0 0 16px;">
            ${isFullRefund
              ? `Hemos procesado el reembolso completo de tu pedido <strong>${escapeHtml(order.order_number)}</strong> por un importe de <strong>${formatPrice(refundedAmountEUR)}</strong>. El plazo de acreditación en tu tarjeta depende de tu entidad (habitualmente unos días laborables).`
              : `Se ha registrado un reembolso parcial de <strong>${formatPrice(refundedAmountEUR)}</strong> sobre el pedido <strong>${escapeHtml(order.order_number)}</strong>. Si quedara importe pendiente, te avisaremos cuando se complete.`}
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Condiciones y devoluciones: <a href="${site}/devoluciones" style="color: #2d4a3e;">${site}/devoluciones</a>
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.6; margin: 0;">
            Dudas: <a href="mailto:info@inmoalia.com" style="color: #2d4a3e;">info@inmoalia.com</a>
          </p>
        </div>
        <p style="text-align: center; color: #a08c7a; font-size: 12px; margin-top: 20px;">© INMOALIA</p>
      </div>
    `,
  })
}

/** Cancelación operativa (p. ej. desde el panel) sobre un pedido que ya estaba pagado o en curso. */
export async function sendOrderCancelledNotice(order: Order) {
  if (!isResendConfigured()) return

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
  const address = order.shipping_address as unknown as ShippingAddress
  const who = escapeHtml(address.full_name?.trim() || order.customer_email)

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to: order.customer_email,
    subject: `Pedido cancelado — ${order.order_number}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #2a2a2a; margin: 0;">INMOALIA</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; border: 1px solid #e8ddd0;">
          <h2 style="color: #2a2a2a; font-size: 20px; margin: 0 0 12px;">Tu pedido ha sido cancelado</h2>
          <p style="color: #6b5344; font-size: 15px; line-height: 1.65; margin: 0 0 16px;">
            Hola ${who},
          </p>
          <p style="color: #6b5344; font-size: 15px; line-height: 1.65; margin: 0 0 16px;">
            Te informamos de que el pedido <strong>${escapeHtml(order.order_number)}</strong> figura como <strong>cancelado</strong> en nuestro sistema.
            Si procede un reembolso, recibirás un correo aparte cuando el importe se haya tramitado con la pasarela de pago.
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.6; margin: 0;">
            <a href="${site}/pedidos" style="color: #2d4a3e;">Ver mis pedidos</a>
            · <a href="mailto:info@inmoalia.com" style="color: #2d4a3e;">info@inmoalia.com</a>
          </p>
        </div>
        <p style="text-align: center; color: #a08c7a; font-size: 12px; margin-top: 20px;">© INMOALIA</p>
      </div>
    `,
  })
}

export type AbandonedCartReminderParams = {
  to: string
  resumeUrl: string
  productNames: string[]
}

/** Solo con consentimiento explícito de marketing (checkbox en checkout). */
export async function sendAbandonedCartReminder({ to, resumeUrl, productNames }: AbandonedCartReminderParams) {
  if (!isResendConfigured()) return

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
  const preview =
    escapeHtml(productNames.slice(0, 4).join(', ')) + (productNames.length > 4 ? '…' : '')

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to,
    subject: 'Has dejado productos en tu carrito — INMOALIA',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #2a2a2a; margin: 0;">INMOALIA</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; border: 1px solid #e8ddd0;">
          <h2 style="color: #2a2a2a; font-size: 20px; margin: 0 0 12px;">¿Seguimos con tu pedido?</h2>
          <p style="color: #6b5344; font-size: 15px; line-height: 1.65; margin: 0 0 16px;">
            Dejaste artículos en el carrito: <strong>${preview || 'varios productos'}</strong>.
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.6; margin: 0 0 22px;">
            Puedes retomarlo con este enlace (válido mientras conservemos la copia y no completes la compra):
          </p>
          <div style="text-align: center;">
            <a href="${resumeUrl}"
               style="display: inline-block; background: #2d4a3e; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Volver al carrito
            </a>
          </div>
          <p style="color: #a08c7a; font-size: 11px; line-height: 1.55; margin: 24px 0 0;">
            Recibes este mensaje porque aceptaste un recordatorio de carrito abandonado en el checkout.
            Ley de información: marketing en base a consentimiento. Puedes dejar de recibir correos dejando de usar esta función o escribiendo a info@inmoalia.com.
          </p>
          <p style="color: #6b5344; font-size: 13px; margin: 12px 0 0;">
            <a href="${site}/privacidad" style="color: #2d4a3e;">Privacidad</a>
          </p>
        </div>
      </div>
    `,
  })
}

