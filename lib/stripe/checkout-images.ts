import { absoluteUrl } from '@/lib/site'

/** Stripe exige URLs absolutas https en product_data.images (no rutas /imagenes/...). */
export function toStripeProductImages(image: string | null | undefined): string[] {
  if (!image?.trim()) return []

  const trimmed = image.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return [trimmed]
  }

  if (trimmed.startsWith('/')) {
    return [absoluteUrl(trimmed)]
  }

  return []
}
