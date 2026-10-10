-- ============================================================
-- BODEGA DNAVITS — MIGRACIÓN: PASARELA DE PAGO + ESTADOS PEDIDO
-- Pega esto en Supabase > SQL Editor y ejecuta con "RUN"
-- ============================================================

-- 1. Columnas nuevas en configuracion
ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS pasarela_activa boolean DEFAULT false;
ALTER TABLE public.configuracion ADD COLUMN IF NOT EXISTS mp_modo text DEFAULT 'sandbox';
-- NOTA: El Access Token NO va aquí — va en Vercel Environment Variables como MP_ACCESS_TOKEN

-- 2. Columnas nuevas en pedidos para seguimiento de pagos
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS mp_payment_id text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS mp_preference_id text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS mp_status text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS numero_orden_seq integer;

-- 3. El campo estado ya existe ('pendiente'), aseguramos que acepte los 3 valores
-- Si existe un check constraint viejo, lo eliminamos y recreamos
DO $$
BEGIN
  -- Eliminar constraint viejo si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pedidos_estado_check'
    AND table_name = 'pedidos'
  ) THEN
    ALTER TABLE public.pedidos DROP CONSTRAINT pedidos_estado_check;
  END IF;
END $$;

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('pendiente', 'en_proceso', 'entregado'));

-- 4. Índices para búsqueda rápida por payment_id y estado
CREATE INDEX IF NOT EXISTS idx_pedidos_mp_payment_id ON public.pedidos(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);

-- 5. RLS para pedidos — permitir inserción desde el webhook del servidor
-- El webhook usa la service role key (bypassa RLS), pero por claridad:
DROP POLICY IF EXISTS "Admin puede ver todos los pedidos" ON public.pedidos;
CREATE POLICY "Admin puede ver todos los pedidos" ON public.pedidos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_whitelist
      WHERE lower(email) = lower(auth.jwt() ->> 'email') AND activo = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Función para generar numero_orden_seq automáticamente
CREATE SEQUENCE IF NOT EXISTS pedido_seq START 1000;

CREATE OR REPLACE FUNCTION public.asignar_numero_orden()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_orden_seq IS NULL THEN
    NEW.numero_orden_seq := nextval('pedido_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_asignar_numero_orden ON public.pedidos;
CREATE TRIGGER trg_asignar_numero_orden
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.asignar_numero_orden();

-- ============================================================
-- ¡LISTO! Ahora agrega en Vercel Environment Variables:
--   MP_ACCESS_TOKEN = APP_USR-xxxx...  (tu token de producción)
--   MP_MODO = produccion               (o 'sandbox' para pruebas)
-- ============================================================
