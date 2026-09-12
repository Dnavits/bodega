-- ==============================================================================
-- BODEGA DNAVITS: ACTUALIZACIÓN COMPLETA DE COLUMNAS EN SUPABASE
-- Copia este script en Supabase > SQL Editor y dale "RUN" para sincronizar todo.
-- ==============================================================================

-- 1. Columnas en configuracion (ajustes y personalización)
alter table public.configuracion add column if not exists banner_anuncio text default '🍻 Bebidas heladas a domicilio en Medellín';
alter table public.configuracion add column if not exists nombre_bodega text default 'Bodega Dnavits';
alter table public.configuracion add column if not exists telefono_contacto text default '3019519391';
alter table public.configuracion add column if not exists whatsapp_pedidos text default '573019519391';
alter table public.configuracion add column if not exists direccion_bodega text default 'Medellín, Antioquia';
alter table public.configuracion add column if not exists costo_domicilio integer default 5000;
alter table public.configuracion add column if not exists pedido_minimo integer default 20000;
alter table public.configuracion add column if not exists favicon_url text;
alter table public.configuracion add column if not exists logo_url text;

-- Personalización visual de la tienda
alter table public.configuracion add column if not exists titulo_pestana text;
alter table public.configuracion add column if not exists hero_badge text default 'DOMICILIOS EXPRESS · MEDELLÍN';
alter table public.configuracion add column if not exists hero_titulo text default 'Tus bebidas heladas,';
alter table public.configuracion add column if not exists hero_subtitulo_rainbow text default 'en minutos';
alter table public.configuracion add column if not exists hero_descripcion text default 'Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos.';
alter table public.configuracion add column if not exists hero_features text[] default '{"⚡ Entrega en <45 min", "❄️ Siempre frío", "💳 Nequi · Efectivo · Transferencia"}';
alter table public.configuracion add column if not exists mostrar_whatsapp_flotante boolean default true;

-- 2. Columnas en productos
alter table public.productos add column if not exists descripcion text;
alter table public.productos add column if not exists precio_comparacion integer;
alter table public.productos add column if not exists sku text;
alter table public.productos add column if not exists destacado boolean default false;

-- 3. Recargar la memoria del servidor de inmediato
notify pgrst, 'reload schema';
