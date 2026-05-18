import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeAccountEmail } from '@/lib/resend/emails'

/**
 * Endpoint de prueba para verificar que Resend está configurado correctamente.
 * Solo funciona en desarrollo.
 * 
 * Uso: GET /api/test-email?to=tu-email@ejemplo.com
 */
export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Este endpoint solo está disponible en desarrollo' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json(
      { error: 'Parámetro "to" requerido. Ejemplo: /api/test-email?to=tu@email.com' },
      { status: 400 }
    )
  }

  // Validar formato de email básico
  if (!to.includes('@') || !to.includes('.')) {
    return NextResponse.json(
      { error: 'Email inválido' },
      { status: 400 }
    )
  }

  console.log('[TEST-EMAIL] Intentando enviar email de prueba a:', to)

  try {
    const result = await sendWelcomeAccountEmail({
      to,
      name: 'Prueba de Email',
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado correctamente',
        emailId: result.id,
        to,
        from: process.env.RESEND_FROM_EMAIL || 'info@inmoalia.com',
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Error al enviar el email. Verifica la configuración de Resend.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[TEST-EMAIL] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Error al enviar el email',
      },
      { status: 500 }
    )
  }
}
