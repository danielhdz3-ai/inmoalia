import { Resend } from 'resend'
import type { Order, OrderItem, ShippingAddress } from '@/lib/supabase/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'pedidos@inmoalia.com'

export async function sendOrderConfirmation(order: Order) {
  const items = order.items as unknown as OrderItem[]
  const address = order.shipping_address as unknown as ShippingAddress

  const itemsList = items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n')

  await resend.emails.send({
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
        </div>
        
        <div style="text-align: center; color: #a08c7a; font-size: 12px; line-height: 1.6;">
          <p>© 2024 INMOALIA — inmoalia.com</p>
          <p>Si tienes preguntas, contáctanos en <a href="mailto:hola@inmoalia.com" style="color: #2d4a3e;">hola@inmoalia.com</a></p>
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
  const address = order.shipping_address as unknown as ShippingAddress

  await resend.emails.send({
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
          
          <p style="color: #6b5344; font-size: 15px; line-height: 1.6; margin: 0;">
            Hola ${address.full_name}, tu pedido está en camino. 
            El tiempo estimado de entrega es de 2-5 días laborables.
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
