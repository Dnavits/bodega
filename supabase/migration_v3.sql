-- Ejecuta esto SOLO SI ya habias corrido schema.sql (o migration_v2.sql)
-- antes de este cambio. Si es tu primera vez, ignora este archivo y usa
-- schema.sql directamente.

alter table pedidos add column if not exists nombre text;
alter table pedidos add column if not exists apellido text;
alter table pedidos add column if not exists telefono text;
alter table pedidos add column if not exists email text;
alter table pedidos add column if not exists direccion text;
alter table pedidos add column if not exists detalle_direccion text;
alter table pedidos add column if not exists barrio text;
alter table pedidos add column if not exists ciudad text;
alter table pedidos add column if not exists lat double precision;
alter table pedidos add column if not exists lng double precision;
alter table pedidos drop column if exists direccion_entrega;

create table if not exists codigos_verificacion (
  email text primary key,
  codigo text not null,
  verificado boolean not null default false,
  expira_at timestamptz not null,
  intentos integer not null default 0
);

alter table codigos_verificacion enable row level security;
create policy "Gestionar el propio codigo de verificacion" on codigos_verificacion for all using (
  email = (auth.jwt() ->> 'email')
) with check (
  email = (auth.jwt() ->> 'email')
);
