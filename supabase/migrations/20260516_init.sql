create extension if not exists pgcrypto;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text,
  client_email text,
  enquiry_text text not null,
  classification text not null,
  confidence double precision not null check (confidence >= 0 and confidence <= 1),
  urgency text not null check (urgency in ('Low', 'Medium', 'High')),
  summary text not null,
  recommended_action text not null,
  suggested_response text not null,
  manual_review boolean not null default false,
  model_used text not null,
  prompt_version text not null,
  raw_ai_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_model text not null default 'openai/gpt-4o-mini',
  temperature double precision not null default 0.2 check (temperature >= 0 and temperature <= 1.5),
  max_tokens integer not null default 650 check (max_tokens >= 100 and max_tokens <= 2000),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_enquiries on public.enquiries;
create trigger set_updated_at_enquiries
before update on public.enquiries
for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_user_settings on public.user_settings;
create trigger set_updated_at_user_settings
before update on public.user_settings
for each row execute function public.handle_updated_at();

alter table public.enquiries enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Users can read own enquiries" on public.enquiries;
create policy "Users can read own enquiries"
on public.enquiries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own enquiries" on public.enquiries;
create policy "Users can insert own enquiries"
on public.enquiries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own enquiries" on public.enquiries;
create policy "Users can update own enquiries"
on public.enquiries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own enquiries" on public.enquiries;
create policy "Users can delete own enquiries"
on public.enquiries
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
