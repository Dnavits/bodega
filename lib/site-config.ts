import { createClient } from "@/lib/supabase/server";
import { WHATSAPP_NUMBER, BODEGA_NAME } from "@/lib/constants";

export type SiteConfig = {
  nombre_bodega:              string;
  subtitulo_bodega:           string;
  logo_url:                   string | null;
  favicon_url:                string | null;
  banner_anuncio:             string | null;
  whatsapp_pedidos:           string;
  telefono_contacto:          string | null;
  direccion_bodega:           string | null;
  costo_domicilio:            number;
  pedido_minimo:              number;
  // Personalización visual
  titulo_pestana:             string | null;
  hero_badge:                 string;
  hero_titulo:                string;
  hero_subtitulo_rainbow:     string;
  hero_descripcion:           string;
  hero_features:              string[];
  mostrar_whatsapp_flotante:  boolean;
  horario_texto:              string;
  horario_inicio:             string;
  horario_fin:                string;
  horario_dias:               string[];
};

const DEFAULT_CONFIG: SiteConfig = {
  nombre_bodega:             BODEGA_NAME,
  subtitulo_bodega:          "Licores & Bebidas Heladas",
  logo_url:                  null,
  favicon_url:               null,
  banner_anuncio:            null,
  whatsapp_pedidos:          WHATSAPP_NUMBER,
  telefono_contacto:         null,
  direccion_bodega:          null,
  costo_domicilio:           3000,
  pedido_minimo:             15000,
  titulo_pestana:            null,
  hero_badge:                "DOMICILIOS EXPRESS · MEDELLÍN",
  hero_titulo:               "Tus bebidas heladas,",
  hero_subtitulo_rainbow:    "en minutos",
  hero_descripcion:          "Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos.",
  hero_features:             ["Entrega en 1-2 días hábiles", "Siempre frío", "Nequi · Efectivo · Transferencia"],
  mostrar_whatsapp_flotante: true,
  horario_texto:             'Lunes a Domingo: 9:00 AM - 11:00 PM',
  horario_inicio:            '09:00',
  horario_fin:               '23:00',
  horario_dias:              ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracion")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) return DEFAULT_CONFIG;

    // Procesar hero_features si viene como string JSON o array
    let features = DEFAULT_CONFIG.hero_features;
    if (Array.isArray(data.hero_features) && data.hero_features.length > 0) {
      features = data.hero_features;
    } else if (typeof data.hero_features === "string") {
      try {
        const parsed = JSON.parse(data.hero_features);
        if (Array.isArray(parsed)) features = parsed;
      } catch {
        features = data.hero_features.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    return {
      nombre_bodega:             data.nombre_bodega             ?? DEFAULT_CONFIG.nombre_bodega,
      subtitulo_bodega:          data.subtitulo_bodega          ?? DEFAULT_CONFIG.subtitulo_bodega,
      logo_url:                  data.logo_url                  ?? null,
      favicon_url:               data.favicon_url               ?? null,
      banner_anuncio:            data.banner_anuncio            ?? null,
      whatsapp_pedidos:          data.whatsapp_pedidos          ?? DEFAULT_CONFIG.whatsapp_pedidos,
      telefono_contacto:         data.telefono_contacto         ?? null,
      direccion_bodega:          data.direccion_bodega          ?? null,
      costo_domicilio:           data.costo_domicilio           ?? DEFAULT_CONFIG.costo_domicilio,
      pedido_minimo:             data.pedido_minimo             ?? DEFAULT_CONFIG.pedido_minimo,
      titulo_pestana:            data.titulo_pestana            ?? null,
      hero_badge:                data.hero_badge                ?? DEFAULT_CONFIG.hero_badge,
      hero_titulo:               data.hero_titulo               ?? DEFAULT_CONFIG.hero_titulo,
      hero_subtitulo_rainbow:    data.hero_subtitulo_rainbow    ?? DEFAULT_CONFIG.hero_subtitulo_rainbow,
      hero_descripcion:          data.hero_descripcion          ?? DEFAULT_CONFIG.hero_descripcion,
      hero_features:             features,
      mostrar_whatsapp_flotante: data.mostrar_whatsapp_flotante !== false,
      horario_texto:             data.horario_texto ?? DEFAULT_CONFIG.horario_texto,
      horario_inicio:            data.horario_inicio ?? DEFAULT_CONFIG.horario_inicio,
      horario_fin:               data.horario_fin ?? DEFAULT_CONFIG.horario_fin,
      horario_dias:              Array.isArray(data.horario_dias) ? data.horario_dias : DEFAULT_CONFIG.horario_dias,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
