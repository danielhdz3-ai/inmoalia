import { NextResponse } from 'next/server'

/** HTML mínimo para 404 de producto (middleware; evita soft 404 en Google). */
export function productNotFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Página no encontrada | INMOALIA</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #fdfcfa; color: #2a2a2a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .box { text-align: center; max-width: 28rem; }
    .code { font-size: 5rem; font-weight: 700; color: #e8ddd0; line-height: 1; margin-bottom: 1rem; }
    p { color: #a08c7a; line-height: 1.6; margin-bottom: 2rem; }
    a { display: inline-block; background: #2d4a3e; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="box">
    <div class="code">404</div>
    <h1>Página no encontrada</h1>
    <p>La página que buscas no existe o ha sido movida.</p>
    <a href="/">Volver al inicio</a>
  </div>
</body>
</html>`
}

export function productNotFoundResponse(): NextResponse {
  return new NextResponse(productNotFoundHtml(), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
