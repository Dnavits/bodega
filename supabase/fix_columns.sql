-- ==============================================================================
-- BODEGA DNAVITS: SOLUCIÓN INTEGRAL DE BASE DE DATOS Y PERMISOS RLS
-- Copia este script en Supabase > SQL Editor y haz clic en "RUN".
-- ==============================================================================

-- 1. TABLA ADMIN WHITELIST (Lista blanca de administradores)
create table if not exists public.admin_whitelist (
  email text primary key,
  nombre text,
  activo boolean default true,
  created_at timestamptz default now()
);

alter table public.admin_whitelist enable row level security;
drop policy if exists "Lectura admin_whitelist" on public.admin_whitelist;
create policy "Lectura admin_whitelist" on public.admin_whitelist for select using (true);

-- Insertar administrador inicial si no existe
insert into public.admin_whitelist (email, nombre, activo)
values ('terrorgm1@gmail.com', 'Dnavits Administrador', true)
on conflict (email) do update set activo = true;


-- 2. TABLA PROFILES (Perfiles de usuarios clientes y administradores)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nombre text,
  avatar_url text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Lectura publica o propia de perfiles" on public.profiles;
drop policy if exists "Actualizacion del propio perfil" on public.profiles;
drop policy if exists "Insertar perfiles" on public.profiles;
create policy "Lectura publica o propia de perfiles" on public.profiles for select using (true);
create policy "Actualizacion del propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Insertar perfiles" on public.profiles for insert with check (true);


-- 3. TRIGGER SEGURO PARA NUEVOS USUARIOS (Evita "Database error saving new user")
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_is_admin boolean := false;
  v_nombre text;
  v_avatar text;
begin
  -- Chequear con seguridad si el correo está en la lista blanca
  begin
    select exists (
      select 1 from public.admin_whitelist 
      where lower(email) = lower(new.email) and activo = true
    ) into v_is_admin;
  exception when others then
    v_is_admin := false;
  end;

  v_nombre := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'nombre',
    split_part(new.email, '@', 1)
  );

  v_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  -- Insertar perfil de manera segura sin bloquear jamás el registro del usuario
  begin
    insert into public.profiles (id, email, nombre, avatar_url, role)
    values (
      new.id,
      new.email,
      v_nombre,
      v_avatar,
      case when v_is_admin then 'admin' else 'cliente' end
    )
    on conflict (id) do update set
      email = excluded.email,
      nombre = coalesce(excluded.nombre, public.profiles.nombre),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      role = case when v_is_admin then 'admin' else public.profiles.role end;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Reconectar el trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. TABLA CONFIGURACION (Asegurar columnas y permisos RLS)
create table if not exists public.configuracion (
  id integer primary key default 1,
  nombre_bodega text default 'Bodega Dnavits',
  created_at timestamptz default now()
);

alter table public.configuracion add column if not exists banner_anuncio text default '🍻 Bebidas heladas a domicilio en Medellín';
alter table public.configuracion add column if not exists nombre_bodega text default 'Bodega Dnavits';
alter table public.configuracion add column if not exists subtitulo_bodega text default 'Licores & Bebidas Heladas';
alter table public.configuracion add column if not exists telefono_contacto text default '3019519391';
alter table public.configuracion add column if not exists whatsapp_pedidos text default '573019519391';
alter table public.configuracion add column if not exists direccion_bodega text default 'Medellín, Antioquia';
alter table public.configuracion add column if not exists costo_domicilio integer default 5000;
alter table public.configuracion add column if not exists pedido_minimo integer default 20000;
alter table public.configuracion add column if not exists favicon_url text;
alter table public.configuracion add column if not exists logo_url text;
alter table public.configuracion add column if not exists titulo_pestana text;
alter table public.configuracion add column if not exists hero_badge text default 'DOMICILIOS EXPRESS · MEDELLÍN';
alter table public.configuracion add column if not exists hero_titulo text default 'Tus bebidas heladas,';
alter table public.configuracion add column if not exists hero_subtitulo_rainbow text default 'en minutos';
alter table public.configuracion add column if not exists hero_descripcion text default 'Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos.';
alter table public.configuracion add column if not exists hero_features text[] default '{"Entrega en 1-2 días hábiles", "Siempre frío", "Nequi · Efectivo · Transferencia"}';
alter table public.configuracion add column if not exists mostrar_whatsapp_flotante boolean default true;
alter table public.configuracion add column if not exists horario_texto text default 'Lunes a Domingo: 9:00 AM - 11:00 PM';
alter table public.configuracion add column if not exists horario_inicio time default '09:00';
alter table public.configuracion add column if not exists horario_fin time default '23:00';
alter table public.configuracion add column if not exists horario_dias text[] default '{"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"}';

-- Permisos RLS para configuracion
alter table public.configuracion enable row level security;
drop policy if exists "Lectura publica configuracion" on public.configuracion;
drop policy if exists "Solo admin edita configuracion" on public.configuracion;
drop policy if exists "Solo admin modifica configuracion" on public.configuracion;

create policy "Lectura publica configuracion" on public.configuracion for select using (true);
create policy "Solo admin modifica configuracion" on public.configuracion for all using (
  exists (
    select 1 from public.admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
) with check (
  exists (
    select 1 from public.admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 5. TABLA PEDIDOS (Asegurar columnas y permisos de compra)
create table if not exists public.pedidos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  numero_orden serial,
  total integer not null check (total >= 0),
  estado text not null default 'pendiente',
  nombre text not null,
  telefono text not null,
  direccion text not null,
  barrio text not null,
  created_at timestamptz default now()
);

alter table public.pedidos add column if not exists metodo_pago text default 'efectivo';
alter table public.pedidos add column if not exists notas text;
alter table public.pedidos add column if not exists detalle_direccion text;
alter table public.pedidos add column if not exists barrio text default '';
alter table public.pedidos add column if not exists ciudad text default 'Medellín';
alter table public.pedidos add column if not exists email text;
alter table public.pedidos add column if not exists numero_orden serial;

-- Permisos RLS para pedidos (¡Permite a clientes y visitantes comprar!)
alter table public.pedidos enable row level security;
drop policy if exists "Clientes ven sus pedidos" on public.pedidos;
drop policy if exists "Clientes insertan pedidos" on public.pedidos;
drop policy if exists "Solo admin gestiona pedidos" on public.pedidos;

create policy "Clientes ven sus pedidos" on public.pedidos for select using (true);
create policy "Clientes insertan pedidos" on public.pedidos for insert with check (true);
create policy "Solo admin gestiona pedidos" on public.pedidos for all using (
  exists (
    select 1 from public.admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 6. TABLA PEDIDO ITEMS
create table if not exists public.pedido_items (
  id uuid default gen_random_uuid() primary key,
  pedido_id uuid references public.pedidos on delete cascade not null,
  producto_id uuid,
  cantidad integer not null check (cantidad > 0),
  precio_unitario integer not null check (precio_unitario >= 0),
  created_at timestamptz default now()
);

alter table public.pedido_items enable row level security;
drop policy if exists "Lectura pedido_items" on public.pedido_items;
drop policy if exists "Insertar pedido_items" on public.pedido_items;

create policy "Lectura pedido_items" on public.pedido_items for select using (true);
create policy "Insertar pedido_items" on public.pedido_items for insert with check (true);


-- 7. TABLA PRODUCTOS (Asegurar columnas y lectura pública)
alter table public.productos add column if not exists descripcion text;
alter table public.productos add column if not exists precio_comparacion integer;
alter table public.productos add column if not exists sku text;
alter table public.productos add column if not exists destacado boolean default false;

alter table public.productos enable row level security;
drop policy if exists "Cualquiera puede ver productos activos" on public.productos;
drop policy if exists "Solo admin modifica productos" on public.productos;

create policy "Cualquiera puede ver productos activos" on public.productos for select using (true);
create policy "Solo admin modifica productos" on public.productos for all using (
  exists (
    select 1 from public.admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 8. RECARGAR MEMORIA DE SUPABASE DE INMEDIATO
notify pgrst, 'reload schema';
