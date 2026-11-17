create table if not exists public.site_settings (
  id text primary key default 'default' check (id = 'default'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
alter table public.site_settings enable row level security;

drop policy if exists "Anyone reads site settings" on public.site_settings;
drop policy if exists "Admins write site settings" on public.site_settings;

create policy "Anyone reads site settings" on public.site_settings
for select using (true);

create policy "Admins write site settings" on public.site_settings
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
