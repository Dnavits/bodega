import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function GET(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const mp = new MercadoPagoConfig({ accessToken: accessToken! });
    const paymentClient = new Payment(mp);
    // id del ultimo pago: 185469153086
    const p = await paymentClient.get({ id: 185469153086 });
    return NextResponse.json({
      id: p.id,
      preference_id: p.preference_id,
      order: p.order,
      metadata: p.metadata,
      additional_info: p.additional_info,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
