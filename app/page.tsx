import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Tienda } from "@/components/Tienda";
import { CartDrawer } from "@/components/CartDrawer";
import { BodegaFooter } from "@/components/BodegaFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getSiteConfig } from "@/lib/site-config";

// Forzar dinamismo para reflejar en tiempo real la configuración y productos
export const dynamic = "force-dynamic";

export default async function Home() {
  const { logoUrl } = await getSiteConfig();

  return (
    <div className="relative min-h-screen bg-vault-950 text-foam flex flex-col selection:bg-amber/30 selection:text-amber-light">
      <Navbar logoUrl={logoUrl} />
      <main className="flex-1">
        <Hero />
        <Tienda />
      </main>
      <BodegaFooter />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  );
}
