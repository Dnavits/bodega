import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let redirect = requestUrl.searchParams.get("redirect") || "/";
  // Sanitizar redirección: solo permitir rutas relativas locales seguras
  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    redirect = "/";
  }

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirigir a la URL solicitada (por ejemplo /admin o /)
  return NextResponse.redirect(new URL(redirect, requestUrl.origin));
}
