-- Execute no SQL Editor do Supabase se a migration 001 já foi aplicada.
alter table public.barbershops add column if not exists photo_url text;

-- Bucket público usado apenas para fotos de perfil das barbearias.
insert into storage.buckets (id, name, public)
values ('barbershop-images', 'barbershop-images', true)
on conflict (id) do update set public = true;

create policy "public reads barbershop images" on storage.objects for select
using (bucket_id = 'barbershop-images');

create policy "owners upload barbershop images" on storage.objects for insert to authenticated
with check (bucket_id = 'barbershop-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners update barbershop images" on storage.objects for update to authenticated
using (bucket_id = 'barbershop-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners delete barbershop images" on storage.objects for delete to authenticated
using (bucket_id = 'barbershop-images' and (storage.foldername(name))[1] = auth.uid()::text);
