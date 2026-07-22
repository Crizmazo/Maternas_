-- Ejecuta este archivo completo en Supabase > SQL Editor. Crea tu usuario administrador
-- después desde Authentication > Users; no guardes contraseñas en este proyecto.
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(), url text not null, storage_path text, category text, alt text,
  featured boolean default false, published boolean default true, sort_order integer default 0, created_at timestamptz default now()
);
create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(), type text not null check (type in ('service','product','price')),
  name text not null, description text not null default '', price text, published boolean default true, sort_order integer default 0, created_at timestamptz default now()
);
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(), name text not null, phone text not null, email text not null,
  service text, preferred_date date, message text, created_at timestamptz default now()
);
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1), studio_name text, city text, whatsapp_number text, email text, updated_at timestamptz default now()
);
insert into public.site_settings (id, studio_name, city, whatsapp_number) values (1, 'Luz Estudio', 'Medellín, Colombia', '573000000000') on conflict (id) do nothing;
alter table public.photos enable row level security; alter table public.catalog_items enable row level security; alter table public.appointments enable row level security; alter table public.site_settings enable row level security;
create policy "public reads photos" on public.photos for select using (published = true);
create policy "public reads catalog" on public.catalog_items for select using (published = true);
create policy "public reads settings" on public.site_settings for select using (true);
create policy "admins manage photos" on public.photos for all to authenticated using (true) with check (true);
create policy "admins manage catalog" on public.catalog_items for all to authenticated using (true) with check (true);
create policy "admins manage appointments" on public.appointments for all to authenticated using (true) with check (true);
create policy "admins manage settings" on public.site_settings for all to authenticated using (true) with check (true);
-- En Storage crea un bucket público llamado "photos" y agrega estas políticas:
insert into storage.buckets (id, name, public) values ('photos','photos',true) on conflict (id) do update set public=true;
create policy "admins upload images" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
create policy "admins delete images" on storage.objects for delete to authenticated using (bucket_id = 'photos');
