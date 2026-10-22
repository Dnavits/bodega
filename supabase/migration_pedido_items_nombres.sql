-- ============================================================
-- BODEGA DNAVITS: Agregar nombre e imagen a pedido_items
-- Pega esto en Supabase > SQL Editor y ejecuta con "RUN"
-- ============================================================

ALTER TABLE public.pedido_items ADD COLUMN IF NOT EXISTS nombre_producto text;
ALTER TABLE public.pedido_items ADD COLUMN IF NOT EXISTS imagen_url text;
