import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bodega Dnavits | Gaseosas, Cervezas, Aguas & Licores a Domicilio",
  description:
    "Bodega mayorista y al detal en Medellín. Bebidas frías, gaseosas, agua purificada, cervezas nacionales e importadas directo a tu puerta. Entregas en menos de 45 minutos.",
  keywords: [
    "bodega de gaseosas",
    "cervezas a domicilio Medellín",
    "gaseosas por paca",
    "bebidas frías",
    "distribuidora de licores",
    "agua a domicilio",
    "bodega Dnavits",
  ],
  openGraph: {
    title: "Bodega Dnavits · Gaseosas y Bebidas a Domicilio",
    description:
      "Pide tus bebidas frías al instante con entregas en menos de 45 min en Medellín y el Valle de Aburrá.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-canvas text-ink font-inter min-h-screen antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
