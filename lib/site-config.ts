import { createClient } from "@/lib/supabase/server";
import { WHATSAPP_NUMBER, BODEGA_NAME } from "@/lib/constants";

export type SiteConfig = {
  nombre_bodega:     string;
  logo_url:          string | null;
  favicon_url:       string | null;
  banner_anuncio:    string | null;
  whatsapp_pedidos:  string;
  telefono_contacto: string | null;
  direccion_bodega:  string | null;
  costo_domicilio:   number;
  pedido_minimo:     number;
};

const DEFAULT_CONFIG: SiteConfig = {
  nombre_bodega:     BODEGA_NAME,
  logo_url:          null,
  favicon_url:       null,
  banner_anuncio:    null,
  whatsapp_pedidos:  WHATSAPP_NUMBER,
  telefono_contacto: null,
  direccion_bodega:  null,
  costo_domicilio:   3000,
  pedido_minimo:     15000,
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracion")
      .select(
        "nombre_bodega, logo_url, favicon_url, banner_anuncio, whatsapp_pedidos, telefono_contacto, direccion_bodega, costo_domicilio, pedido_minimo"
      )
      .single();

    if (error || !data) return DEFAULT_CONFIG;

    return {
      nombre_bodega:     data.nombre_bodega     ?? DEFAULT_CONFIG.nombre_bodega,
      logo_url:          data.logo_url          ?? null,
      favicon_url:       data.favicon_url       ?? null,
      banner_anuncio:    data.banner_anuncio    ?? null,
      whatsapp_pedidos:  data.whatsapp_pedidos  ?? DEFAULT_CONFIG.whatsapp_pedidos,
      telefono_contacto: data.telefono_contacto ?? null,
      direccion_bodega:  data.direccion_bodega  ?? null,
      costo_domicilio:   data.costo_domicilio   ?? DEFAULT_CONFIG.costo_domicilio,
      pedido_minimo:     data.pedido_minimo     ?? DEFAULT_CONFIG.pedido_minimo,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
