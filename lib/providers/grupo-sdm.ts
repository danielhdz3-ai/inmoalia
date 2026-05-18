import type { Order, OrderItem } from '@/lib/supabase/types'

/**
 * GRUPO SDM - Proveedor mayorista de muebles y decoración
 * 
 * Málaga, España
 * Tel: 952 426 920
 * WhatsApp: 663 883 455 / 663 813 157
 * Email: comercial@gruposdm.com
 * 
 * ⚠️ IMPORTANTE: Grupo SDM NO tiene API pública.
 * Este archivo contiene funciones helper para gestión manual de pedidos.
 * 
 * PROCESO:
 * 1. Cuando se recibe un pedido en Inmoalia, se genera automáticamente
 * 2. El admin debe hacer el pedido MANUALMENTE a Grupo SDM por:
 *    - Email: comercial@gruposdm.com
 *    - WhatsApp: 663 883 455
 *    - Teléfono: 952 426 920
 * 3. Proporcionarles los SKUs y cantidades
 * 4. Actualizar manualmente el tracking en Supabase cuando envíen
 */

const GRUPO_SDM_CONTACT = {
  name: 'Grupo SDM',
  phone: '952426920',
  whatsapp: '34663883455',
  email: 'comercial@gruposdm.com',
  address: 'Calle Ignacio Aldecoa, 15, 29004 Málaga, España',
}

export interface GrupoSDMProduct {
  sku: string // Código del producto en Grupo SDM
  name: string
  description: string
  price: number // Precio de venta al público (PVP)
  cost_price: number // Precio de compra mayorista
  images: string[]
  category: string
  stock: number // Disponibilidad (verificar con ellos)
  weight_kg?: number
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  material?: string
  color?: string
}

/**
 * Genera el texto del pedido para enviar a Grupo SDM por email o WhatsApp
 */
export function generateGrupoSDMOrderText(order: Order): string {
  const items = order.items as unknown as OrderItem[]
  const address = order.shipping_address as any

  let text = `🛍️ NUEVO PEDIDO INMOALIA\n\n`
  text += `📋 Referencia: ${order.order_number}\n`
  text += `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n\n`

  text += `📦 PRODUCTOS:\n`
  items.forEach((item, idx) => {
    text += `${idx + 1}. ${item.name}\n`
    text += `   SKU: ${item.supplier_sku || item.sku || 'N/A'}\n`
    text += `   Cantidad: ${item.quantity}\n\n`
  })

  text += `📍 DIRECCIÓN DE ENVÍO:\n`
  text += `${address.full_name}\n`
  text += `${address.address_line1}\n`
  if (address.address_line2) text += `${address.address_line2}\n`
  text += `${address.postal_code} ${address.city}\n`
  text += `${address.province}, ${address.country}\n`
  if (address.phone) text += `Tel: ${address.phone}\n`

  text += `\n💶 TOTAL PRODUCTOS: ${items.reduce((sum, item) => sum + item.quantity, 0)} unidades\n`
  text += `\n⚠️ Por favor, confirmar disponibilidad y enviar número de tracking.`

  return text
}

/**
 * Genera un enlace de WhatsApp pre-rellenado con el pedido
 */
export function generateGrupoSDMWhatsAppLink(order: Order): string {
  const text = generateGrupoSDMOrderText(order)
  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${GRUPO_SDM_CONTACT.whatsapp}?text=${encodedText}`
}

/**
 * Genera el asunto y cuerpo del email para Grupo SDM
 */
export function generateGrupoSDMEmail(order: Order): { subject: string; body: string } {
  return {
    subject: `Pedido ${order.order_number} - INMOALIA`,
    body: generateGrupoSDMOrderText(order),
  }
}

/**
 * Helper para verificar si un producto es de Grupo SDM
 */
export function isGrupoSDMProduct(supplierSku: string | null | undefined): boolean {
  if (!supplierSku) return false
  
  // Los SKUs de Grupo SDM suelen tener formato: XXX.XXXXXXX
  // Ejemplo: 712.SPARGSNE, 518.SNIN18ANE, 738.SGPHINSVE
  return /^\d{3,4}\.[A-Z0-9]{6,}$/i.test(supplierSku)
}

/**
 * Mapeo de categorías INMOALIA → Grupo SDM
 */
export const CATEGORY_MAPPING: Record<string, string> = {
  'sillas-oficina': 'Oficinas > Sillas de Oficinas',
  'sillones-direccion': 'Oficinas > Sillones de Dirección',
  'sillas-operativas': 'Oficinas > Sillas Operativas',
  'mesas': 'Hostelería > Mesas',
  'sillas': 'Hostelería > Sillas',
  'iluminacion': 'Iluminación',
  'jardin': 'Hogar > Jardín',
}

export const GRUPO_SDM_INFO = GRUPO_SDM_CONTACT
