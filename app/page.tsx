import { getSiteConfig } from "@/lib/site-config";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Tienda } from "@/components/Tienda";
import { CartDrawer } from "@/components/CartDrawer";
import { BodegaFooter } from "@/components/BodegaFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <>
      <Navbar
        logoUrl={config.logo_url}
        bannerAnuncio={config.banner_anuncio}
        whatsappPedidos={config.whatsapp_pedidos}
      />
      <main className="pt-28">
        <Hero whatsappPedidos={config.whatsapp_pedidos} />
        <Tienda />
      </main>
      <BodegaFooter
        whatsapp={config.whatsapp_pedidos}
        telefono={config.telefono_contacto}
        direccion={config.direccion_bodega}
      />
      <CartDrawer whatsapp={config.whatsapp_pedidos} />
      <FloatingWhatsApp whatsapp={config.whatsapp_pedidos} />
    </>
  );
}
