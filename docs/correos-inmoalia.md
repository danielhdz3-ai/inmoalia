# Correos transaccionales INMOALIA

Los mensajes pueden salir desde **dos sitios**:

1. **Resend desde el código Next.js** (remitente `RESEND_FROM_EMAIL`, p. ej. `info@inmoalia.com`): bienvenida de cuenta verificada, pedidos y envíos, newsletter cuando esté configurado.
2. **Supabase Auth** (confirmación de registro, cambio de email, reset de contraseña): por defecto los envía Supabase (`noreply@mail.app.supabase.io`). Para que el remitente sea **INMOALIA** y el envío pase por **Resend**, debes activar **SMTP personalizado** en el panel de Supabase.

## 1. SMTP de Supabase → Resend (imprescindible para quitar el “noreply” de Supabase)

En [Resend](https://resend.com) verifica el dominio `inmoalia.com` y crea una API key.

En **Supabase Dashboard** → **Project Settings** → **Authentication** → **SMTP Settings**:

- Activa **Custom SMTP**.
- Valores habituales con Resend (comprueba en [documentación actual de Resend](https://resend.com/docs/send-with-supabase-smtp)):
  - **Host:** `smtp.resend.com`
  - **Port:** `465` (SSL) o el que indique Resend
  - **Username:** `resend`
  - **Password:** tu API key de Resend
  - **Sender email:** la misma que uses en `RESEND_FROM_EMAIL` (debe estar verificada en Resend)
  - **Sender name:** `INMOALIA`

Luego en **Authentication** → **Email Templates** personaliza asunto y cuerpo (confirmación, magic link, recuperación, etc.) para que el texto sea de INMOALIA. El **envío** lo hará Resend vía SMTP; el diseño del enlace de confirmación lo sigue generando Supabase con la plantilla que edites.

**Redirect URLs** en Supabase deben incluir:

- `https://inmoalia.com/api/auth/callback`
- `http://localhost:3000/api/auth/callback` (desarrollo)

## 2. Emails que envía ya la aplicación (Resend directo en código)

| Flujo | Archivo / ruta | Notas |
|--------|-----------------|--------|
| Bienvenida tras verificar email (o primer OAuth) | `lib/resend/emails.ts` → `sendWelcomeAccountEmail`, disparado en `app/api/auth/callback/route.ts` | Una sola vez por usuario (`welcome_email_sent` en metadata). |
| Confirmación de pedido | `sendOrderConfirmation` | Webhook Stripe. |
| Pedido en camino | `sendShippingNotification` | Cuando lo implementes al marcar enviado. |
| Newsletter / suscripción pie de tienda | `app/api/newsletter/route.ts` | Opcional audiencia `RESEND_AUDIENCE_ID`. |

Variables en Vercel / `.env.local`:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (ej. `info@inmoalia.com`)
- `NEXT_PUBLIC_SITE_URL` (enlaces en plantillas)

## 3. Resumen

- **Sin SMTP en Supabase:** los correos de “Confirma tu cuenta” seguirán saliendo como Supabase (aunque edites textos en el panel).
- **Con SMTP Resend en Supabase + plantillas:** esos mismos correos los **enta** Resend como si fueran INMOALIA.
- La **carta de bienvenida extra** después de confirmar la cuenta la envía el código con Resend; no sustituye al email de confirmación de Supabase, lo complementa.
