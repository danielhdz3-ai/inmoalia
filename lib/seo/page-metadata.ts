import type { Metadata } from 'next'
import { absoluteUrl, indexingRobotsMetadata } from '@/lib/site'

type ShopPageMetadataOptions = {
  /** Páginas de carrito, checkout, login, etc. */
  noindex?: boolean
}

/** Metadatos consistentes: título, descripción, canonical y robots. */
export function shopPageMetadata(
  title: string,
  description: string,
  pathname: string,
  options?: ShopPageMetadataOptions,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(pathname) },
    robots: options?.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : indexingRobotsMetadata(),
  }
}

/** true si la URL tiene query params de filtrado o paginación (no indexar). */
export function hasListingFilters(
  params: Record<string, string | undefined>,
  keys = ['sort', 'min', 'max', 'material', 'color', 'featured', 'q', 'page', 'categoria'],
): boolean {
  return keys.some((k) => {
    const v = params[k]
    return v !== undefined && v !== ''
  })
}
