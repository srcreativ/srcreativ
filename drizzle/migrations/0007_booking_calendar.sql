create table public.booking_notes (
  id uuid primary key default gen_random_uuid(),
  event_date date not null unique,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.booking_notes to authenticated;
grant all on public.booking_notes to service_role;
alter table public.booking_notes enable row level security;
create policy "Admins manage booking calendar" on public.booking_notes for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
