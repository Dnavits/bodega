import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Bodega Dnavits | Gaseosas y bebidas a domicilio",
  description: "Gaseosas, agua y bebidas frías, directo desde nuestra bodega hasta tu puerta en Medellín."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { faviconUrl } = await getSiteConfig();

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.47.0/iconfont/tabler-icons.min.css"
        />
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
      </head>
      <body className="font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
