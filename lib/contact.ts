/** Número WhatsApp sin + ni espacios (ej. 34600123456). */
export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim().replace(/\D/g, '')
  return raw || '34600000000'
}

export function getWhatsAppUrl(message?: string): string {
  const num = getWhatsAppNumber()
  if (!message) return `https://wa.me/${num}`
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function productWhatsAppMessage(productName: string, slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.inmoalia.com'
  return `Hola, me interesa ${productName}. ${base}/productos/${slug}`
}
