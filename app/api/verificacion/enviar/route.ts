import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("codigos_verificacion")
    .upsert({ email, codigo, verificado: false, expira_at: expira, intentos: 0 });

  if (error) {
    return NextResponse.json({ error: "No se pudo generar el código." }, { status: 500 });
  }

  const { enviado } = await sendEmail(
    email,
    "Tu código de verificación - Bodega Dnavits",
    `<p>Tu código de verificación es:</p><h2 style="letter-spacing:4px">${codigo}</h2><p>Vence en 10 minutos.</p>`
  );

  // En desarrollo, si todavia no configuras Resend, devolvemos el
  // codigo para que puedas probar el flujo completo sin enviar
  // correos de verdad. Esto NUNCA debe pasar en produccion.
  const incluirCodigo = !enviado && process.env.NODE_ENV !== "production";

  return NextResponse.json({ ok: true, ...(incluirCodigo ? { codigoDev: codigo } : {}) });
}
