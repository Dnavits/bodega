-- ============================================================
-- BODEGA DNAVITS: Tabla temporal de items por preferencia MP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mp_preference_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  preference_id text NOT NULL,
  producto_id uuid NOT NULL,
  nombre_producto text,
  cantidad integer NOT NULL,
  precio_unitario numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mp_preference_items ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura a service_role (usado en APIs y Server Actions)
DROP POLICY IF EXISTS "Service role full access mp_preference_items" ON public.mp_preference_items;
CREATE POLICY "Service role full access mp_preference_items" ON public.mp_preference_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Permitir lectura por si acaso
DROP POLICY IF EXISTS "Permitir lectura mp_preference_items" ON public.mp_preference_items;
CREATE POLICY "Permitir lectura mp_preference_items" ON public.mp_preference_items
  FOR SELECT USING (true);

-- Permitir insertar anónimamente/authenticated desde las rutas de API
DROP POLICY IF EXISTS "Permitir insertar mp_preference_items" ON public.mp_preference_items;
CREATE POLICY "Permitir insertar mp_preference_items" ON public.mp_preference_items
  FOR INSERT WITH CHECK (true);

-- Índice para búsqueda rápida por preference_id
CREATE INDEX IF NOT EXISTS idx_mp_pref_items_preference_id ON public.mp_preference_items(preference_id);
