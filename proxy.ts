import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de Supabase SSR — CRÍTICO para que los tokens de sesión
 * se renueven automáticamente en cada request del servidor.
 *
 * Sin este archivo, si el usuario inicia sesión desde otro dispositivo
 * o el token JWT vence, el navegador queda con cookies obsoletas y la
 * página no carga hasta que se limpien las cookies manualmente.
 *
 * Con este middleware, el token se refresca de forma transparente y
 * el usuario nunca nota nada.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Primero settear en la request (para que server components los lean)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Luego re-crear la response con las cookies actualizadas
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No llamar a supabase.auth.getSession() aquí.
  // getUser() valida el JWT contra el servidor de Supabase y
  // garantiza que el token sea legítimo en cada request.
  await supabase.auth.getUser();

  return supabaseResponse;
}

// Ejecutar en todas las rutas excepto archivos estáticos y metadatos
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
