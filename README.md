# INMOALIA — Hogar, Jardín y Decoración Premium

Plataforma de dropshipping premium para el mercado español y europeo. Stack 100% headless y moderno.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16+ (App Router) |
| Hosting | Vercel |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Pagos | Stripe (Checkout + Webhooks) |
| Email | Resend |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (Radix UI) |
| Lenguaje | TypeScript estricto |
| Gestor de paquetes | pnpm |

## Inicio rápido

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.local.example .env.local
# → Completar las variables en .env.local

# Iniciar el servidor de desarrollo
pnpm dev
```

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=pedidos@inmoalia.com

# Proveedores
DROPXL_API_KEY=
DROPPERY_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Base de datos

Ejecutar las migraciones en Supabase:

```bash
# Desde el dashboard de Supabase → SQL Editor
# 1. Ejecutar: supabase/migrations/001_schema.sql
# 2. Ejecutar: supabase/migrations/002_seed.sql
```

## Estructura del proyecto

```
inmoalia/
├── app/
│   ├── (shop)/               # Rutas públicas de la tienda
│   ├── (account)/            # Zona privada del cliente
│   ├── (admin)/              # Panel de administración
│   └── api/                  # API Routes
├── components/
│   ├── shop/                 # Componentes de tienda
│   ├── layout/               # Header, Footer
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/             # Cliente Supabase + tipos
│   ├── stripe/               # Cliente Stripe + webhooks
│   ├── resend/               # Emails transaccionales
│   └── providers/            # dropXL + Droppery APIs
├── hooks/                    # useCart, useAuth
├── store/                    # Zustand (carrito)
└── supabase/
    └── migrations/           # SQL migrations + seed
```

## Flujo de pedido

1. Cliente añade al carrito (Zustand, localStorage)
2. Checkout → `/api/orders` crea Stripe Session
3. Cliente paga en Stripe Checkout
4. Webhook `/api/stripe/webhook` → crea Order en Supabase
5. Se lanza pedido automático al proveedor (dropXL / Droppery)
6. Resend envía email de confirmación
7. Proveedor envía → tracking actualiza Order → email de envío

## Proveedores

- **dropXL (vidaXL)**: Proveedor principal de volumen
- **Droppery**: Proveedor boutique europeo premium

## Sincronización

La sincronización automática se ejecuta mediante GitHub Actions diariamente:

```bash
# Sync manual desde admin
POST /api/sync
Authorization: Bearer <SYNC_SECRET_KEY>
Body: { "supplier": "all" | "dropxl" | "droppery" }
```

## Deploy

```bash
# Deploy en Vercel
vercel --prod

# Variables de entorno en Vercel Dashboard
# Stripe webhook endpoint: https://inmoalia.com/api/stripe/webhook
```
