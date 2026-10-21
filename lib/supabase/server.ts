import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Cliente de Supabase para uso en Server Components y Route Handlers.
// La renovación del JWT la maneja el middleware (middleware.ts).
// Aquí solo leemos/escribimos cookies de forma segura con try-catch para
// evitar que errores de cookies obsoletas o read-only rompan la página.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components el cookie store es read-only.
            // El middleware.ts ya se encarga de settear las cookies nuevas
            // antes de que llegue aquí, por lo que este error es seguro ignorar.
          }
        },
      },
    }
  );
}

// Cliente con service role — bypasea RLS completamente.
// Usar SOLO en rutas de servidor de confianza (webhooks, pagos, etc.)
// NUNCA exponer al cliente ni a rutas públicas.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
