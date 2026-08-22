-- Ejecuta esto SOLO SI ya habias corrido schema.sql antes de este cambio.
-- Si es tu primera vez configurando Supabase, ignora este archivo y usa
-- directamente schema.sql (ya incluye estos cambios).

alter table productos add column if not exists imagenes text[] not null default '{}';
update productos set imagenes = array[imagen_url] where imagen_url is not null and imagenes = '{}';
alter table productos drop column if exists imagen_url;
alter table productos add constraint imagenes_max_3 check (array_length(imagenes, 1) <= 3);

create table if not exists configuracion (
  id boolean primary key default true check (id),
  logo_url text,
  favicon_url text
);
insert into configuracion (id) values (true) on conflict do nothing;

alter table configuracion enable row level security;
create policy "Cualquiera ve la configuracion" on configuracion for select using (true);
create policy "Solo admin edita la configuracion" on configuracion for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
