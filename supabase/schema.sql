-- Ejecuta esto en Supabase > SQL Editor. Crea las tablas y activa
-- Row Level Security (RLS): cada regla de abajo es una barrera que
-- Supabase aplica AUNQUE alguien intente llamar a la base de datos
-- directamente, sin pasar por tu app. Aqui es donde vive la seguridad
-- real, no en el frontend.

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz default now()
);

create table productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  precio integer not null check (precio >= 0),
  imagenes text[] not null default '{}' check (array_length(imagenes, 1) <= 3),
  categoria text not null default 'gaseosas',
  stock integer not null default 0 check (stock >= 0),
  activo boolean not null default true,
  created_at timestamptz default now()
);

-- Configuracion del sitio: logo y favicon, editables desde el panel.
-- Es una sola fila (singleton) protegida por el check de "id".
create table configuracion (
  id boolean primary key default true check (id),
  logo_url text,
  favicon_url text
);
insert into configuracion (id) values (true);

create table pedidos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  total integer not null check (total >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'enviado', 'cancelado')),
  wompi_transaction_id text,
  nombre text,
  apellido text,
  telefono text,
  email text,
  direccion text,
  detalle_direccion text,
  barrio text,
  ciudad text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- Codigos de verificacion enviados por correo antes de pagar (anti-bot).
create table codigos_verificacion (
  email text primary key,
  codigo text not null,
  verificado boolean not null default false,
  expira_at timestamptz not null,
  intentos integer not null default 0
);

create table pedido_items (
  id uuid default gen_random_uuid() primary key,
  pedido_id uuid references pedidos on delete cascade not null,
  producto_id uuid references productos not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario integer not null check (precio_unitario >= 0)
);

alter table profiles enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table configuracion enable row level security;
alter table codigos_verificacion enable row level security;

-- codigos_verificacion: cada quien solo puede crear/leer/actualizar
-- el codigo asociado a su propio correo de cuenta.
create policy "Gestionar el propio codigo de verificacion" on codigos_verificacion for all using (
  email = (auth.jwt() ->> 'email')
) with check (
  email = (auth.jwt() ->> 'email')
);

-- configuracion: cualquiera la lee (para mostrar logo/favicon), solo admin la edita
create policy "Cualquiera ve la configuracion" on configuracion for select using (true);
create policy "Solo admin edita la configuracion" on configuracion for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- profiles: cada quien ve y edita solo su propio perfil
create policy "Ver el propio perfil" on profiles for select using (auth.uid() = id);
create policy "Editar el propio perfil" on profiles for update using (auth.uid() = id);

-- productos: cualquiera (incluso sin login) puede ver productos activos;
-- solo un admin puede crear, editar o eliminar
create policy "Cualquiera ve productos activos" on productos for select using (activo = true);
create policy "Admin ve todos los productos" on productos for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Solo admin crea productos" on productos for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Solo admin edita productos" on productos for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Solo admin elimina productos" on productos for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- pedidos: un cliente solo ve y crea sus propios pedidos; el admin ve todos
create policy "Ver los propios pedidos" on pedidos for select using (auth.uid() = user_id);
create policy "Admin ve todos los pedidos" on pedidos for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Crear los propios pedidos" on pedidos for insert with check (auth.uid() = user_id);
create policy "Admin actualiza pedidos" on pedidos for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- pedido_items: visible si el pedido asociado es tuyo o eres admin
create policy "Ver items de los propios pedidos" on pedido_items for select using (
  exists (select 1 from pedidos where pedidos.id = pedido_id and pedidos.user_id = auth.uid())
);
create policy "Admin ve todos los items" on pedido_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Crear items en los propios pedidos" on pedido_items for insert with check (
  exists (select 1 from pedidos where pedidos.id = pedido_id and pedidos.user_id = auth.uid())
);

-- Crea automaticamente un perfil (rol cliente) cada vez que alguien se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, role)
  values (new.id, new.raw_user_meta_data->>'nombre', 'cliente');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Para volverte admin tu mismo (ejecuta una sola vez, con tu propio user id):
-- update profiles set role = 'admin' where id = 'tu-user-id-aqui';
