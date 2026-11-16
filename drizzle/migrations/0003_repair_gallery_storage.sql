-- Run once in the SQL Editor of the active Supabase project.
-- It is safe to run again: it provisions the gallery bucket and refreshes its policies.

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read gallery files" on storage.objects;
drop policy if exists "Admins upload gallery files" on storage.objects;
drop policy if exists "Admins delete gallery files" on storage.objects;

create policy "Public read gallery files"
on storage.objects for select
using (bucket_id = 'gallery');

create policy "Admins upload gallery files"
on storage.objects for insert to authenticated
with check (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete gallery files"
on storage.objects for delete to authenticated
using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));
