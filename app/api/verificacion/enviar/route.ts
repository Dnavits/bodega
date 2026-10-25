import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  // 1. Rate Limiting por IP (máximo 5 solicitudes cada 10 minutos para evitar spam/bombardeo)
  const ip = getClientIp(request);
  const { success } = checkRateLimit(`verify_send_${ip}`, 5, 10 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes de código. Por favor espera unos minutos." },
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

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  // Prevenir que un usuario autenticado envíe códigos a un correo ajeno
  if (user.email && user.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: "No tienes permiso para solicitar códigos para este correo." },
      { status: 403 }
    );
  }

  // Generador criptográficamente seguro (CSPRNG) para evitar predicción de secuencias PRNG
  const codigo = crypto.randomInt(100000, 1000000).toString();
  const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("codigos_verificacion")
    .upsert({ email, codigo, verificado: false, expira_at: expira, intentos: 0 });

  if (error) {
    return NextResponse.json({ error: "No se pudo generar el código." }, { status: 500 });
  }

  const { data: configRow } = await supabase
    .from("configuracion")
    .select("nombre_bodega")
    .limit(1)
    .maybeSingle();
  const nombreBodega = configRow?.nombre_bodega?.trim() || "Bodega Dnavits";

  const { enviado } = await sendEmail(
    email,
    `Tu código de verificación - ${nombreBodega}`,
    `<p>Tu código de verificación para ${nombreBodega} es:</p><h2 style="letter-spacing:4px">${codigo}</h2><p>Vence en 10 minutos.</p>`
  );

  // En desarrollo, si todavía no configuras Resend, devolvemos el código para pruebas locales
  const incluirCodigo = !enviado && process.env.NODE_ENV !== "production";

  return NextResponse.json({ ok: true, ...(incluirCodigo ? { codigoDev: codigo } : {}) });
}
