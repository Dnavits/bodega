-- ==============================================================================
-- BODEGA DNAVITS: ACTUALIZACIÓN DE COLUMNAS Y RECARGA DE SCHEMA CACHE
-- Ejecuta este script en Supabase > SQL Editor para asegurar que todas las columnas
-- de productos y pedidos existan y PostgREST actualice su memoria.
-- ==============================================================================

-- 1. Asegurar columnas en productos
alter table public.productos add column if not exists descripcion text;
alter table public.productos add column if not exists precio_comparacion integer;
alter table public.productos add column if not exists sku text;
alter table public.productos add column if not exists destacado boolean default false;

-- 2. Asegurar columnas en configuracion
alter table public.configuracion add column if not exists direccion_bodega text default 'Medellín, Antioquia';
alter table public.configuracion add column if not exists costo_domicilio integer default 5000;
alter table public.configuracion add column if not exists pedido_minimo integer default 20000;
alter table public.configuracion add column if not exists favicon_url text;

-- 3. Asegurar columnas en profiles
alter table public.profiles add column if not exists email text;

-- 4. Recargar el schema cache de PostgREST inmediatamente
notify pgrst, 'reload schema';
