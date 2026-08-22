import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para uso en componentes del navegador.
// La anon key es publica por diseno: la seguridad real la da
// Row Level Security (RLS), configurado en supabase/schema.sql.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
