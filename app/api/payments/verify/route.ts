import { NextResponse } from "next/server";

// Este endpoint fue reemplazado por un Server Action privado (app/pago/actions.ts).
// Se mantiene para evitar errores en deploys previos, pero no procesa nada.
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ error: "Endpoint no disponible." }, { status: 410 });
}
