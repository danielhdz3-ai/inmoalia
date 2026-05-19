import { Resend } from 'resend'
import type { Order, OrderItem, ShippingAddress } from '@/lib/supabase/types'
import { isResendConfigured } from '@/lib/resend/config'

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

export async function sendOrderConfirmation(order: Order) {
  if (!isResendConfigured()) return

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmoalia.com'
  const items = order.items as unknown as OrderItem[]
  const address = order.shipping_address as unknown as ShippingAddress

  const itemsList = items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n')

  await getResendInstance().emails.send({
    from: `INMOALIA <${FROM}>`,
    to: order.customer_email,
    subject: `Pedido confirmado #${order.order_number} — INMOALIA`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fdfcfa; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #2a2a2a; letter-spacing: -0.5px; margin: 0;">INMOALIA</h1>
          <p style="color: #a08c7a; font-size: 13px; margin: 4px 0 0;">Tu hogar, a otro nivel</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e8ddd0; margin-bottom: 24px;">
          <div style="background: #2d4a3e; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Pedido confirmado</p>
            <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700;">${order.order_number}</p>
          </div>
          
          <p style="color: #2a2a2a; font-size: 15px; margin: 0 0 24px;">Hola ${address.full_name},</p>
          <p style="color: #6b5344; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
            Hemos recibido tu pedido y ya estamos procesándolo. Te notificaremos cuando sea enviado.
          </p>
          
          <h3 style="color: #2a2a2a; font-size: 16px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e8ddd0;">
            Resumen del pedido
          </h3>
          <pre style="font-family: inherit; color: #6b5344; font-size: 14px; line-height: 1.8; margin: 0 0 24px; white-space: pre-wrap;">${itemsList}</pre>
          
          <div style="background: #f9f6f1; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #a08c7a; font-size: 14px;">Subtotal</span>
              <span style="color: #2a2a2a; font-size: 14px;">${formatPrice(order.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #a08c7a; font-size: 14px;">Envío</span>
              <span style="color: ${order.shipping_cost === 0 ? '#27ae60' : '#2a2a2a'}; font-size: 14px;">${order.shipping_cost === 0 ? 'GRATIS' : formatPrice(order.shipping_cost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e8ddd0;">
              <span style="color: #2a2a2a; font-size: 16px; font-weight: 700;">Total</span>
              <span style="color: #2d4a3e; font-size: 16px; font-weight: 700;">${formatPrice(order.total)}</span>
            </div>
          </div>
          
          <h3 style="color: #2a2a2a; font-size: 16px; margin: 0 0 12px;">Dirección de entrega</h3>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.6; margin: 0;">
            ${address.full_name}<br/>
            ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}<br/>
            ${address.postal_code} ${address.city}, ${address.province}<br/>
            ${address.country}
          </p>
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h3 style="color: #2a2a2a; font-size: 15px; margin: 0 0 12px;">
              📦 Información de entrega
            </h3>
            <p style="color: #6b5344; font-size: 14px; line-height: 1.7; margin: 0 0 8px;">
              <strong>Tiempo estimado:</strong> 24-48 horas (productos en stock)<br/>
            </p>
            <p style="color: #6b5344; font-size: 13px; line-height: 1.6; margin: 0;">
              <strong>Importante:</strong> Revisa tu pedido al recibirlo. Si observas algún daño, contacta con nosotros en las primeras 48 horas escribiendo a info@inmoalia.com. Conserva el embalaje original.
            </p>
          </div>
          
          <p style="color: #6b5344; font-size: 14px; line-height: 1.65; margin: 24px 0 0;">
            <strong>Devoluciones:</strong> puedes iniciar cambios hasta <strong>30 días naturales</strong> tras la entrega según nuestra
            <a href="${site}/devoluciones" style="color: #2d4a3e;"> política de devoluciones</a>.
            Gastos habituales por devoluciones no preferentes pueden ser a cargo del comprador salvo defecto de fabricación o error nuestro.
          </p>
          <p style="color: #6b5344; font-size: 14px; line-height: 1.65; margin: 14px 0 0;">
            Sigue tu pedido en <a href="${site}/pedidos" style="color: #2d4a3e;">Mis pedidos</a> dentro de <a href="${site}/cuenta" style="color: #2d4a3e;">Mi cuenta</a>.
          </p>
        </div>
        
        <div style="text-align: center; color: #a08c7a; font-size: 12px; line-height: 1.6;">
          <p>© 2025 INMOALIA — inmoalia.com</p>
          <p>Si tienes preguntas, contáctanos en <a href="mailto:info@inmoalia.com" style="color: #2d4a3e;">info@inmoalia.com</a></p>
        </div>
      </div>
    `,
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

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

