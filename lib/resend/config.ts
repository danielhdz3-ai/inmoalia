/** Evita inicializar llamadas innecesarias o errores cuando no hay entorno de correo configurado */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}
