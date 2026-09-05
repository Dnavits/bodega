import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bodega Dnavits | Gaseosas, Cervezas, Aguas & Licores a Domicilio",
  description: "Bodega mayorista y al detal en Medellín. Bebidas frías, gaseosas, agua purificada, cervezas nacionales e importadas directo a tu puerta.",
  keywords: [
    "bodega de gaseosas",
    "cervezas a domicilio Medellín",
    "gaseosas por paca",
    "bebidas frías",
    "distribuidora de licores",
    "agua a domicilio"
  ],
  openGraph: {
    title: "Bodega Dnavits · Gaseosas y Bebidas a Domicilio",
    description: "Pide tus bebidas frías al instante con entregas inmediatas en Medellín y el Valle de Aburrá.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090D14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={roboto.variable}>
      <body className="bg-vault-950 text-foam font-sans min-h-screen selection:bg-amber/30 selection:text-amber-light antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
