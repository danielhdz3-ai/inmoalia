/**
 * API Proxy para servir imágenes de Grupo SDM sin hotlinking
 * Las imágenes se descargan en memoria y se sirven directamente
 * Next.js las cachea automáticamente en .next/cache (temporal)
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 })
  }

  // Validar que sea una URL de Grupo SDM
  if (!imageUrl.includes('gruposdm.com')) {
    return new NextResponse('Invalid image source', { status: 400 })
  }

  try {
    // Descargar la imagen con headers apropiados para evitar bloqueo
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://gruposdm.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      // Cachear durante 7 días
      next: { revalidate: 604800 }
    })

    if (!response.ok) {
      console.error(`Error fetching image: ${response.status} ${response.statusText}`)
      return new NextResponse('Image not found', { status: 404 })
    }

    // Obtener el buffer de la imagen (en memoria, NO en disco)
    const imageBuffer = await response.arrayBuffer()

    // Determinar content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Servir la imagen con caché headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // 7 días
        'CDN-Cache-Control': 'public, max-age=604800',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Error loading image', { status: 500 })
  }
}
