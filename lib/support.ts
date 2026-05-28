export const SUPPORT_EMAIL = 'info@inmoalia.com'

export function supportMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return qs ? `mailto:${SUPPORT_EMAIL}?${qs}` : `mailto:${SUPPORT_EMAIL}`
}

export function productSupportMailto(productName: string, productSlug: string): string {
  const url = `https://www.inmoalia.com/productos/${productSlug}`
  return supportMailto(
    `Consulta: ${productName}`,
    `Hola,\n\nTengo una consulta sobre este producto:\n${productName}\n${url}\n\n`,
  )
}
