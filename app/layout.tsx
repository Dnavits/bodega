import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { getSiteConfig } from "@/lib/site-config";
import { VersionChecker } from "@/components/VersionChecker";

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

  const fullTitle =
    config.titulo_pestana ||
    `${nombre} | Gaseosas, Cervezas, Aguas & Licores a Domicilio`;

  const ogTitle = config.meta_titulo || `${nombre} · Gaseosas y Bebidas a Domicilio`;
  const ogDescription =
    config.meta_descripcion ||
    `Pide tus bebidas frías al instante con entregas en menos de 45 min en Medellín y el Valle de Aburrá con ${nombre}.`;

  const ogImages = config.meta_imagen_url
    ? [
        {
          url: config.meta_imagen_url,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ]
    : undefined;

  return {
    title: {
      default: fullTitle,
      template: `%s · ${nombre}`,
    },
    description: ogDescription,
    icons: config.favicon_url
      ? {
          icon: config.favicon_url,
          shortcut: config.favicon_url,
          apple: config.favicon_url,
        }
      : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale: "es_CO",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: config.meta_imagen_url ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      images: config.meta_imagen_url ? [config.meta_imagen_url] : undefined,
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
        <CartProvider>
          {children}
          <VersionChecker />
        </CartProvider>
      </body>
    </html>
  );
}
