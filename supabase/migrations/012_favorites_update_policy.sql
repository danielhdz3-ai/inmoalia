-- Permite UPSERT desde la API (/api/favorites POST con onConflict) bajo políticas RLS.

drop policy if exists "Users can update own favorites" on favorites;

create policy "Users can update own favorites"
  on favorites
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
