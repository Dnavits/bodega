/**
 * lib/constants.ts
 * Central source of truth for all hardcoded values.
 * Import from here — never hardcode in components.
 */

export const WHATSAPP_NUMBER = "573019519391";
export const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}`;

export const BODEGA_NAME     = "Bodega Dnavits";
export const BODEGA_CIUDAD   = "Medellín";
export const BODEGA_PAIS     = "Colombia";

export const CATEGORIAS_PRODUCTOS = [
  "gaseosas",
  "cervezas",
  "aguas",
  "licores",
  "otros",
] as const;

export type CategoriaProducto = typeof CATEGORIAS_PRODUCTOS[number];

export const CATEGORIA_LABELS: Record<CategoriaProducto, string> = {
  gaseosas: "Gaseosas",
  cervezas: "Cervezas",
  aguas:    "Aguas",
  licores:  "Licores",
  otros:    "Otros",
};

export const ESTADOS_PEDIDO = [
  "pendiente",
  "confirmado",
  "en_camino",
  "entregado",
  "cancelado",
] as const;

export type EstadoPedido = typeof ESTADOS_PEDIDO[number];

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente:  "Pendiente",
  confirmado: "Confirmado",
  en_camino:  "En camino",
  entregado:  "Entregado",
  cancelado:  "Cancelado",
};

export const STOCK_BAJO_UMBRAL   = 10;
export const STOCK_MEDIO_UMBRAL  = 20;
