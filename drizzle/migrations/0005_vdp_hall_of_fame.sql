-- SR Studio VDP: reports remain private; only published acknowledgements are public.
create table if not exists public.vdp_program_settings (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint vdp_program_settings_singleton check (id = 'default')
);

create table if not exists public.vdp_hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text not null,
  category text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  recognition_date text not null,
  reference_id text,
  profile_url text,
  note text not null,
  featured boolean not null default false,
  published boolean not null default true,
  certificate_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (certificate_id)
);

create table if not exists public.vdp_reports (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  researcher_name text not null,
  researcher_email text not null,
  affected_asset text not null,
  category text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  proof_of_concept text not null,
  profile_url text,
  status text not null default 'New' check (status in ('New', 'Triaging', 'Accepted', 'Fixed', 'Duplicate', 'Informative')),
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vdp_program_settings enable row level security;
alter table public.vdp_hall_of_fame enable row level security;
alter table public.vdp_reports enable row level security;

grant select on public.vdp_program_settings to anon, authenticated;
grant select on public.vdp_hall_of_fame to anon, authenticated;
grant insert on public.vdp_reports to anon, authenticated;
grant select, insert, update, delete on public.vdp_program_settings, public.vdp_hall_of_fame, public.vdp_reports to authenticated;

create policy "Anyone reads VDP settings" on public.vdp_program_settings for select using (true);
create policy "Admins manage VDP settings" on public.vdp_program_settings for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Anyone reads published Hall of Fame" on public.vdp_hall_of_fame for select using (published or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage Hall of Fame" on public.vdp_hall_of_fame for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Anyone can submit VDP report" on public.vdp_reports for insert with check (char_length(researcher_name) between 1 and 120 and char_length(proof_of_concept) between 1 and 20000);
create policy "Admins read and manage VDP reports" on public.vdp_reports for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
