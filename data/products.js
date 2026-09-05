/**
 * ==============================================================================
 * GUÍA DE MIGRACIÓN A IMÁGENES LOCALES:
 * ==============================================================================
 * Para sustituir las imágenes de Unsplash por tus propias fotografías:
 * 1. Guarda tus fotos en la carpeta `/public/productos/` (ej: `/public/productos/ramo-1.jpg`).
 * 2. Cambia las URLs en este archivo por la ruta relativa correspondiente:
 *    `images: ["/productos/ramo-1.jpg", "/productos/ramo-1-detalle.jpg", ...]`
 * 3. Al desplegar en Vercel, Next.js servirá las imágenes automáticamente desde `/public`.
 * ==============================================================================
 */

export const WHATSAPP_NUMBER = "573019519391";
export const NEQUI_NUMBER = "3014231003";
export const INSTAGRAM_HANDLE = "@Momentos_Abigail";
export const INSTAGRAM_URL = "https://instagram.com/Momentos_Abigail";

export const CATEGORIES = [
  "Todos",
  "Rosas",
  "Girasoles",
  "Buchones",
  "Cajas de Lujo"
];

export const PRODUCTS = [
  {
    id: "buchon-imperio-morado",
    name: "Ramo Buchón Imperial Morado Real",
    category: "Buchones",
    price: 185000,
    priceFormatted: "$185.000 COP",
    tag: "Más Vendido",
    tagColor: "atelier",
    customColor: true,
    description: "Imponente ramo buchón de 50 rosas eternas elaboradas meticulosamente a mano en satín de alto gramaje con acabado tornasolado morado y toques dorados. Un tributo a la alta floristería artesanal que nunca pierde su forma ni su brillo.",
    attributes: [
      "Satín premium de alta densidad anti-deformación",
      "50 rosas artesanales con detalles dorados",
      "Envoltorio coreano impermeable de lujo",
      "Incluye corona ornamental y mariposas con relieve"
    ],
    images: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "bouquet-rosas-terciopelo",
    name: "Bouquet Velvet Noir & Lavanda",
    category: "Rosas",
    price: 95000,
    priceFormatted: "$95.000 COP",
    tag: "Colección Atelier",
    tagColor: "atelier",
    customColor: true,
    description: "Composición minimalista y sofisticada con 24 rosas de satín en gama lavanda fría y púrpura crepúsculo. Acabado editorial inspirado en las boutiques parisinas, con cinta de seda y lazo artesanal.",
    attributes: [
      "24 rosas en satín sedoso de textura aterciopelada",
      "Papel coreano mate de diseñador",
      "Selección libre de gama cromática sin costo",
      "Tarjeta personalizada con dedicatoria en papel fino"
    ],
    images: [
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "girasoles-eternidad-aurora",
    name: "Ramo Girasoles Aurora & Púrpura",
    category: "Girasoles",
    price: 110000,
    priceFormatted: "$110.000 COP",
    tag: "Edición Exclusiva",
    tagColor: "atelier",
    customColor: true,
    description: "Girasoles eternos esculpidos pétalo a pétalo en satín amarillo canario con centro texturizado, enmarcado con follaje en satín y contraste con follaje lavanda. Un rayo de luz imperecedero.",
    attributes: [
      "12 girasoles eternos en satín multicapa",
      "Centro bordado a mano con relieve tridimensional",
      "Empaque rígido estructurado con lazo doble",
      "Ideal para celebraciones, grados y aniversarios"
    ],
    images: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "caja-lujo-orquidea-nocturna",
    name: "Hatbox Royal Satin & Orquídeas",
    category: "Cajas de Lujo",
    price: 160000,
    priceFormatted: "$160.000 COP",
    tag: "Premium",
    tagColor: "atelier",
    customColor: true,
    description: "Caja cilíndrica rígida tipo sombrerera de lujo con tapa forrada, rellena de 36 rosas eternas en satín marfil y violeta imperial, acompañada de un collar con estuche de obsequio.",
    attributes: [
      "Caja sombrerera rígida con estampado en stamping dorado",
      "Arreglo semiesférico compacto de 36 rosas",
      "Resistente al polvo y la humedad ambiental",
      "Estructura decorativa perfecta para interiores"
    ],
    images: [
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "buchon-gigante-monarca",
    name: "Buchón Majestuoso Monarca (100 Rosas)",
    category: "Buchones",
    price: 295000,
    priceFormatted: "$295.000 COP",
    tag: "Magno Atelier",
    tagColor: "atelier",
    customColor: true,
    description: "La máxima expresión del atelier: 100 rosas de satín perfectamente alineadas en cúpula con iluminación micro-LED cálida incorporada. Una pieza de colección inolvidable.",
    attributes: [
      "100 rosas confeccionadas 100% a mano",
      "Iluminación micro-LED con interruptor discreto",
      "Corona con circones de fantasía premium",
      "Entrega protegida en empaque especial"
    ],
    images: [
      "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "ramo-girasol-rosas-fusion",
    name: "Ramo Fusión Amatista & Girasol",
    category: "Girasoles",
    price: 135000,
    priceFormatted: "$135.000 COP",
    tag: "Favorito del Mes",
    tagColor: "atelier",
    customColor: true,
    description: "Contraste vibrante y contemporáneo entre girasoles dorados centrales y una constelación de rosas en satín morado profundo con mariposas caladas.",
    attributes: [
      "Combinación de 6 girasoles grandes y 20 rosas",
      "Mariposas 3D con corte láser holográfico",
      "Envoltorio bicapa negro mate y papel seda",
      "Aromatizado con fragancia floral de larga duración"
    ],
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export function generateWhatsAppLink(productName, priceFormatted) {
  const message = `Hola Momentos Abigail ✨, me interesa ordenar el *${productName}* (${priceFormatted}). Me gustaría consultar disponibilidad y colores para mi entrega en Medellín/Valle de Aburrá.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generateGeneralWhatsAppLink() {
  const message = "Hola Momentos Abigail ✨, me gustaría recibir asesoría personalizada sobre sus ramos de flores eternas en satín y opciones de personalización.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
