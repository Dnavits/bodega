import { createServerClient } from "@supabase/ssr";
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
