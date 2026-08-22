import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { email, codigo } = await request.json();

  const { data: registro } = await supabase
    .from("codigos_verificacion")
    .select("*")
    .eq("email", email)
    .single();

  if (!registro) {
    return NextResponse.json({ error: "Solicita un código primero." }, { status: 400 });
  }
  if (new Date(registro.expira_at) < new Date()) {
    return NextResponse.json({ error: "El código venció, solicita uno nuevo." }, { status: 400 });
  }
  if (registro.intentos >= 5) {
    return NextResponse.json({ error: "Demasiados intentos, solicita un código nuevo." }, { status: 429 });
  }
  if (registro.codigo !== codigo) {
    await supabase
      .from("codigos_verificacion")
      .update({ intentos: registro.intentos + 1 })
      .eq("email", email);
    return NextResponse.json({ error: "Código incorrecto." }, { status: 400 });
  }

  await supabase.from("codigos_verificacion").update({ verificado: true }).eq("email", email);

  return NextResponse.json({ ok: true });
}
