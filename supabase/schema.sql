-- ==============================================================================
-- BODEGA DNAVITS: SCHEMA SUPABASE COMPLETO CON LISTA BLANCA DE ADMINISTRADORES
-- ==============================================================================

-- 1. Tabla de administradores en lista blanca (Whitelist)
-- Los correos registrados en esta tabla tienen acceso total al Dashboard administrativo.
create table if not exists admin_whitelist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  nombre text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Habilitar RLS en whitelist
alter table admin_whitelist enable row level security;

-- Política de lectura: cualquier usuario autenticado o anónimo puede verificar si un correo está permitido
create policy "Lectura de admin_whitelist" on admin_whitelist for select using (true);
create policy "Solo admins gestionan whitelist" on admin_whitelist for all using (
  exists (select 1 from admin_whitelist where email = auth.jwt()->>'email' and activo = true)
);

-- Insertar el correo del propietario por defecto en la lista blanca
insert into admin_whitelist (email, nombre, activo)
values ('terrorgm1@gmail.com', 'Dnavits Administrador', true)
on conflict (email) do update set activo = true;


-- 2. Tabla de perfiles de usuario vinculada a auth.users (Google Auth y Correo)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nombre text,
  avatar_url text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Lectura publica o propia de perfiles" on profiles for select using (true);
create policy "Actualizacion del propio perfil" on profiles for update using (auth.uid() = id);


-- 3. Tabla de Productos de la Bodega (Gaseosas, Aguas, Cervezas, Licores, Snacks)
create table if not exists productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  precio integer not null check (precio >= 0),
  precio_comparacion integer,
  imagenes text[] not null default '{}',
  categoria text not null default 'gaseosas',
  stock integer not null default 0 check (stock >= 0),
  sku text,
  activo boolean not null default true,
  destacado boolean default false,
  created_at timestamptz default now()
);

alter table productos enable row level security;

create policy "Cualquiera puede ver productos activos" on productos for select using (true);
create policy "Solo admin modifica productos" on productos for all using (
  exists (
    select 1 from admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 4. Tabla de Configuración de la Bodega
create table if not exists configuracion (
  id boolean primary key default true check (id),
  nombre_bodega text default 'Bodega Dnavits',
  telefono_contacto text default '3019519391',
  whatsapp_pedidos text default '573019519391',
  logo_url text,
  favicon_url text,
  banner_anuncio text default '🍻 Envíos fríos en menos de 45 minutos en Medellín · Gaseosas, Cervezas y Licores',
  direccion_bodega text default 'Medellín, Antioquia',
  costo_domicilio integer default 5000,
  pedido_minimo integer default 20000,
  wompi_public_key text,
  created_at timestamptz default now()
);

insert into configuracion (id, nombre_bodega) values (true, 'Bodega Dnavits')
on conflict (id) do nothing;

alter table configuracion enable row level security;
create policy "Lectura publica configuracion" on configuracion for select using (true);
create policy "Solo admin edita configuracion" on configuracion for update using (
  exists (
    select 1 from admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 5. Tabla de Pedidos / Órdenes tipo Shopify
create table if not exists pedidos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  numero_orden serial,
  total integer not null check (total >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado')),
  metodo_pago text default 'efectivo',
  nombre text not null,
  telefono text not null,
  email text,
  direccion text not null,
  detalle_direccion text,
  barrio text not null,
  ciudad text default 'Medellín',
  notas text,
  created_at timestamptz default now()
);

alter table pedidos enable row level security;

create policy "Clientes ven sus pedidos" on pedidos for select using (auth.uid() = user_id or auth.uid() is null);
create policy "Clientes insertan pedidos" on pedidos for insert with check (true);
create policy "Solo admin gestiona pedidos" on pedidos for all using (
  exists (
    select 1 from admin_whitelist 
    where email = (auth.jwt()->>'email') and activo = true
  ) or exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);


-- 6. Items de cada Pedido
create table if not exists pedido_items (
  id uuid default gen_random_uuid() primary key,
  pedido_id uuid references pedidos on delete cascade not null,
  producto_id uuid references productos not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario integer not null check (precio_unitario >= 0)
);

alter table pedido_items enable row level security;
create policy "Lectura pedido_items" on pedido_items for select using (true);
create policy "Insertar pedido_items" on pedido_items for insert with check (true);


-- 7. Trigger Automático para Nuevos Usuarios (Google Auth o Email)
-- Asigna rol admin si el correo está en admin_whitelist automáticamente!
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_is_admin boolean;
  v_nombre text;
  v_avatar text;
begin
  -- Chequear si el correo está en la lista blanca de administradores
  select exists (
    select 1 from public.admin_whitelist 
    where lower(email) = lower(new.email) and activo = true
  ) into v_is_admin;

  -- Extraer nombre desde metadata de Google o registro normal
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
    nombre = coalesce(excluded.nombre, profiles.nombre),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    role = case when v_is_admin then 'admin' else profiles.role end;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
