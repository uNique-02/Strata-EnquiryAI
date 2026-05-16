alter table public.user_settings
add column if not exists public_api_key text;

create unique index if not exists user_settings_public_api_key_unique
on public.user_settings (public_api_key)
where public_api_key is not null;

