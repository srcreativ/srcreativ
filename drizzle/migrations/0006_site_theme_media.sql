-- Run after 0003. This bucket stores only public presentation assets selected by administrators.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site media" on storage.objects;
drop policy if exists "Admins upload site media" on storage.objects;
drop policy if exists "Admins update site media" on storage.objects;
drop policy if exists "Admins delete site media" on storage.objects;

create policy "Public read site media" on storage.objects for select
using (bucket_id = 'site-media');
create policy "Admins upload site media" on storage.objects for insert to authenticated
with check (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update site media" on storage.objects for update to authenticated
using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete site media" on storage.objects for delete to authenticated
using (bucket_id = 'site-media' and public.has_role(auth.uid(), 'admin'));
