import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Tienda } from "@/components/Tienda";
import { CartDrawer } from "@/components/CartDrawer";
import { BodegaFooter } from "@/components/BodegaFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CookieBanner } from "@/components/CookieBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const nombre = config.nombre_bodega || "Bodega Dnavits";
  const fullTitle =
    config.titulo_pestana ||
    `${nombre} | Gaseosas, Cervezas, Aguas & Licores a Domicilio`;

  return {
    title: fullTitle,
    description: `${nombre} en Medellín. Bebidas frías, gaseosas por paca, cervezas nacionales e importadas y licores a domicilio.`,
    icons: config.favicon_url
      ? {
          icon: config.favicon_url,
          shortcut: config.favicon_url,
          apple: config.favicon_url,
        }
      : undefined,
  };
}

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <>
      <Navbar
        nombreBodega={config.nombre_bodega}
        subtituloBodega={config.subtitulo_bodega}
        logoUrl={config.logo_url}
        bannerAnuncio={config.banner_anuncio}
        whatsappPedidos={config.whatsapp_pedidos}
      />
      <main className="pt-28">
        <Hero
          nombreBodega={config.nombre_bodega}
          badge={config.hero_badge}
          titulo={config.hero_titulo}
          subtituloRainbow={config.hero_subtitulo_rainbow}
          descripcion={config.hero_descripcion}
          features={config.hero_features}
          whatsappPedidos={config.whatsapp_pedidos}
        />
        <Tienda />
      </main>
      <BodegaFooter
        nombreBodega={config.nombre_bodega}
        logoUrl={config.logo_url}
        whatsapp={config.whatsapp_pedidos}
        telefono={config.telefono_contacto}
        direccion={config.direccion_bodega}
        horarioTexto={config.horario_texto}
        horarioInicio={config.horario_inicio}
        horarioFin={config.horario_fin}
      />
      <CartDrawer
        whatsapp={config.whatsapp_pedidos}
        nombreBodega={config.nombre_bodega}
      />
      <FloatingWhatsApp
        whatsapp={config.whatsapp_pedidos}
        nombreBodega={config.nombre_bodega}
        visible={config.mostrar_whatsapp_flotante}
      />
      <CookieBanner />
    </>
  );
}
