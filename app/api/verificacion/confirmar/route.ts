import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  // 1. Rate Limiting por IP para evitar ataques de fuerza bruta en códigos de 6 dígitos
  const ip = getClientIp(request);
  const { success } = checkRateLimit(`verify_confirm_${ip}`, 10, 5 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados intentos de verificación. Por favor espera unos minutos." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  const email = sanitizeEmail(rawEmail || user.email || "");

  // Prevenir validación cruzada: el usuario sólo puede confirmar su propio correo
  if (user.email && user.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: "No tienes permiso para verificar este correo." },
      { status: 403 }
    );
  }

  // Protección anti-Type Juggling: forzar que 'codigo' sea estrictamente un string numérico de 6 dígitos
  const codigo = typeof body.codigo === "string" ? body.codigo.trim() : "";
  if (!/^\d{6}$/.test(codigo)) {
    return NextResponse.json(
      { error: "El formato del código debe ser numérico de 6 dígitos." },
      { status: 400 }
    );
  }

  const { data: registro } = await supabase
    .from("codigos_verificacion")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!registro) {
    return NextResponse.json({ error: "Solicita un código primero." }, { status: 400 });
  }
  if (new Date(registro.expira_at) < new Date()) {
    return NextResponse.json({ error: "El código venció, solicita uno nuevo." }, { status: 400 });
  }
  if (registro.intentos >= 5) {
    return NextResponse.json({ error: "Demasiados intentos, solicita un código nuevo." }, { status: 429 });
  }

  // Comparación segura en tiempo constante para mitigar Timing Attacks
  const storedCode = String(registro.codigo || "");
  const codeMatch =
    storedCode.length === codigo.length &&
    crypto.timingSafeEqual(Buffer.from(storedCode), Buffer.from(codigo));

  if (!codeMatch) {
    await supabase
      .from("codigos_verificacion")
      .update({ intentos: registro.intentos + 1 })
      .eq("email", email);
    return NextResponse.json({ error: "Código incorrecto." }, { status: 400 });
  }

  await supabase.from("codigos_verificacion").update({ verificado: true }).eq("email", email);

  return NextResponse.json({ ok: true });
}
