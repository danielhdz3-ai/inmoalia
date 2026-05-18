-- Aviso de cancelación vía panel: evita reenviar si ya se notificó cierre al cliente
alter table orders add column if not exists order_closure_notice_sent_at timestamptz;

-- Carrito abandonado: solo filas con consentimiento explícito (checkbox checkout)
create table if not exists abandoned_cart_snapshots (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  cart jsonb not null,
  recovery_token text not null unique,
  consent_reminder boolean not null default true,
  last_activity_at timestamptz not null default now(),
  reminder_sent_at timestamptz,
  discarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_abandoned_cart_cron
  on abandoned_cart_snapshots (last_activity_at, reminder_sent_at)
  where discarded_at is null and consent_reminder = true;

create trigger abandoned_cart_snapshots_updated_at before update on abandoned_cart_snapshots
  for each row execute function update_updated_at();

alter table abandoned_cart_snapshots enable row level security;
