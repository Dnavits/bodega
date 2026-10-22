-- ============================================================
-- BODEGA DNAVITS: Columnas de Metadatos Sociales / Open Graph
-- Pega esto en Supabase > SQL Editor y dale a RUN
-- ============================================================

ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS meta_titulo text;
ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS meta_descripcion text;
ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS meta_imagen_url text;
