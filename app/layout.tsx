import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { getSiteConfig } from "@/lib/site-config";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const nombre = config.nombre_bodega || "Bodega Dnavits";

  return {
    title: {
      default: `${nombre} | Gaseosas, Cervezas, Aguas & Licores a Domicilio`,
      template: `%s · ${nombre}`,
    },
    description: `${nombre} en Medellín. Bebidas frías, gaseosas por paca, cervezas nacionales e importadas y licores a domicilio.`,
    icons: config.favicon_url
      ? {
          icon: config.favicon_url,
          shortcut: config.favicon_url,
          apple: config.favicon_url,
        }
      : undefined,
    openGraph: {
      title: `${nombre} · Gaseosas y Bebidas a Domicilio`,
      description: `Pide tus bebidas frías al instante con entregas en menos de 45 min en Medellín y el Valle de Aburrá con ${nombre}.`,
      locale: "es_CO",
      type: "website",
    },
  };
}

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
