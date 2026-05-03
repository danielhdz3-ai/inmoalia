-- ============================================
-- FAVORITOS — tabla por usuario
-- ============================================

create table if not exists favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_favorites_user_id on favorites(user_id);

alter table favorites enable row level security;

-- Solo el propio usuario puede leer/escribir sus favoritos
create policy "Users can read own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on favorites
  for delete using (auth.uid() = user_id);
