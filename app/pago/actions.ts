"use server";

import { MercadoPagoConfig, Payment } from "mercadopago";
import { createServiceClient } from "@/lib/supabase/server";

export async function verificarPago(paymentId: string, paramPreferenceId?: string | null): Promise<{ ok: boolean; created: boolean }> {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken || !paymentId) return { ok: false, created: false };

    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);

    let paymentData: any;
    try {
      paymentData = await paymentClient.get({ id: parseInt(paymentId) });
    } catch {
      return { ok: false, created: false };
    }

    const mpStatus = paymentData.status;
    const mpPaymentId = paymentData.id?.toString();
    const mpPreferenceId = paymentData.preference_id || paramPreferenceId || null;
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

    // Reconstruir items desde Supabase usando preference_id (más confiable que metadata de MP)
    let itemsValidados: { producto_id: string; nombre_producto: string; imagen_url: string | null; cantidad: number; precio_unitario: number }[] = [];

    if (mpPreferenceId) {
      const { data: prefItems } = await supabase
        .from("mp_preference_items")
        .select("producto_id, nombre_producto, cantidad, precio_unitario")
        .eq("preference_id", mpPreferenceId);

      if (prefItems && prefItems.length > 0) {
        // Obtener imagen_url de productos
        const { data: prods } = await supabase
          .from("productos")
          .select("id, imagen_url, stock")
          .in("id", prefItems.map((i) => i.producto_id));
        const prodsMap = Object.fromEntries((prods || []).map((p) => [p.id, p]));

        itemsValidados = prefItems.map((i) => ({
          producto_id: i.producto_id,
          nombre_producto: i.nombre_producto,
          imagen_url: prodsMap[i.producto_id]?.imagen_url || null,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        }));

        // Descontar stock
        for (const item of itemsValidados) {
          const prod = prodsMap[item.producto_id];
          if (prod && typeof prod.stock === "number") {
            await supabase.from("productos").update({ stock: Math.max(0, prod.stock - item.cantidad) }).eq("id", item.producto_id);
          }
        }
      }
    }

    // Fallback: metadata.items_raw
    if (itemsValidados.length === 0) {
      let itemsRaw: { id: string; cantidad: number }[] = [];
      try { itemsRaw = JSON.parse(metadata.items_raw || "[]"); } catch { itemsRaw = []; }

      let productosReales: any[] = [];
      if (itemsRaw.length > 0) {
        const { data } = await supabase
          .from("productos")
          .select("id, nombre, precio, stock, imagen_url")
          .in("id", itemsRaw.map((i) => i.id));
        productosReales = data || [];
      }
      for (const item of itemsRaw) {
        const real = productosReales.find((p) => p.id === item.id);
        if (real) {
          itemsValidados.push({ producto_id: real.id, nombre_producto: real.nombre, imagen_url: real.imagen_url || null, cantidad: item.cantidad, precio_unitario: real.precio });
          await supabase.from("productos").update({ stock: Math.max(0, real.stock - item.cantidad) }).eq("id", real.id);
        }
      }
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

    if (error || !pedido) return { ok: false, created: false };

    // Insertar items (el stock ya fue descontado arriba)
    if (itemsValidados.length > 0) {
      await supabase.from("pedido_items").insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));
    }

    return { ok: true, created: true };
  } catch {
    return { ok: false, created: false };
  }
}
