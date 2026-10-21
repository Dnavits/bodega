"use server";

import { MercadoPagoConfig, Payment } from "mercadopago";
import { createServiceClient } from "@/lib/supabase/server";

export async function verificarPago(paymentId: string): Promise<{ ok: boolean; created: boolean; debug?: string }> {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return { ok: false, created: false, debug: "NO_TOKEN" };
    if (!paymentId) return { ok: false, created: false, debug: "NO_PAYMENT_ID" };

    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);

    let paymentData: any;
    try {
      paymentData = await paymentClient.get({ id: parseInt(paymentId) });
    } catch (e: any) {
      return { ok: false, created: false, debug: `MP_GET_FAILED: ${e?.message || String(e)}` };
    }

    const mpStatus = paymentData.status;
    const mpPaymentId = paymentData.id?.toString();
    if (mpStatus !== "approved") return { ok: true, created: false, debug: `STATUS_${mpStatus}` };
    const mpPreferenceId = paymentData.preference_id;
    const metadata = paymentData.metadata || {};
    const totalAmount = paymentData.transaction_amount;

    if (mpStatus !== "approved") return { ok: true, created: false };

    const supabase = createServiceClient();

    // Idempotencia: si ya existe un pedido con este payment_id, no crear otro
    const { data: existente } = await supabase
      .from("pedidos")
      .select("id")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();

    if (existente) return { ok: true, created: false };

    // Reconstruir items desde metadata
    let itemsRaw: { id: string; cantidad: number }[] = [];
    try { itemsRaw = JSON.parse(metadata.items_raw || "[]"); } catch { itemsRaw = []; }

    let productosReales: any[] = [];
    if (itemsRaw.length > 0) {
      const { data } = await supabase
        .from("productos")
        .select("id, nombre, precio, stock")
        .in("id", itemsRaw.map((i) => i.id));
      productosReales = data || [];
    }

    const itemsValidados: { producto_id: string; cantidad: number; precio_unitario: number }[] = [];
    for (const item of itemsRaw) {
      const real = productosReales.find((p) => p.id === item.id);
      if (real) itemsValidados.push({ producto_id: real.id, cantidad: item.cantidad, precio_unitario: real.precio });
    }

    // Crear pedido
    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert({
        total: totalAmount,
        estado: "pendiente",
        metodo_pago: "mercadopago",
        mp_payment_id: mpPaymentId,
        mp_preference_id: mpPreferenceId,
        mp_status: mpStatus,
        transaction_id: `MP-${mpPaymentId}`,
        nombre: metadata.nombre || "",
        telefono: metadata.telefono || "",
        email: metadata.email || null,
        direccion: metadata.direccion || "",
        detalle_direccion: metadata.detalle_direccion || null,
        barrio: metadata.barrio || "",
        ciudad: metadata.ciudad || "Medellín",
        notas: metadata.notas || null,
        user_id: null,
      })
      .select()
      .single();

    if (error || !pedido) return { ok: false, created: false, debug: `DB_INSERT_FAILED: ${error?.message}` };

    // Items y stock
    if (itemsValidados.length > 0) {
      await supabase.from("pedido_items").insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));
      for (const item of itemsValidados) {
        const real = productosReales.find((p) => p.id === item.producto_id);
        if (real && typeof real.stock === "number") {
          await supabase.from("productos").update({ stock: Math.max(0, real.stock - item.cantidad) }).eq("id", real.id);
        }
      }
    }

    return { ok: true, created: true };
  } catch (e: any) {
    return { ok: false, created: false, debug: `CATCH: ${e?.message || String(e)}` };
  }
}
