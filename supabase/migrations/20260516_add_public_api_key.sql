create table if not exists public.public_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Default Key',
  api_key text not null unique,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_api_keys_user_id_idx
on public.public_api_keys (user_id);

drop trigger if exists set_updated_at_public_api_keys on public.public_api_keys;
create trigger set_updated_at_public_api_keys
before update on public.public_api_keys
for each row execute function public.handle_updated_at();

alter table public.public_api_keys enable row level security;

drop policy if exists "Users can read own public api keys" on public.public_api_keys;
create policy "Users can read own public api keys"
on public.public_api_keys
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own public api keys" on public.public_api_keys;
create policy "Users can insert own public api keys"
on public.public_api_keys
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own public api keys" on public.public_api_keys;
create policy "Users can update own public api keys"
on public.public_api_keys
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own public api keys" on public.public_api_keys;
create policy "Users can delete own public api keys"
on public.public_api_keys
for delete
to authenticated
using (auth.uid() = user_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_settings'
      and column_name = 'public_api_key'
  ) then
    insert into public.public_api_keys (user_id, label, api_key)
    select user_id, 'Migrated Key', public_api_key
    from public.user_settings
    where public_api_key is not null
    on conflict (api_key) do nothing;
  end if;
end $$;
