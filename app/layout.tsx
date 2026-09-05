import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const SITE_URL = "https://momentosabigail.vercel.app";
const OG_IMAGE_URL = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&h=630&q=85";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Momentos Abigail | Atelier de Flores Eternas en Satín · Medellín",
  description: "Atelier floral en Medellín especializado en flores eternas y ramos buchones en satín de lujo que nunca se marchitan. Diseño artesanal, color a elección y entregas en Valle de Aburrá.",
  keywords: [
    "flores eternas",
    "flores de satín",
    "ramos buchones Medellín",
    "regalos de lujo Medellín",
    "atelier floral",
    "rosas eternas",
    "girasoles de satín"
  ],
  authors: [{ name: "Momentos Abigail Atelier Floral" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: "Momentos Abigail Atelier Floral",
    title: "Momentos Abigail | Flores Eternas en Satín de Lujo",
    description: "Piezas florales artesanales confeccionadas en satín de alta calidad que conservan su belleza por siempre. Atención directa en Medellín.",
    images: [
      {
        url: OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Momentos Abigail - Ramo de Flores Eternas en Satín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentos Abigail | Flores Eternas en Satín · Medellín",
    description: "Ramos buchones y bouquets eternos hechos a mano en satín de lujo.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17141D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={roboto.variable}>
      <head>
        <link rel="icon" href="/logo.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
      </head>
      <body className="bg-sand text-atelier-950 font-sans min-h-screen selection:bg-atelier-200 selection:text-atelier-900">
        {children}
      </body>
    </html>
  );
}
