import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { QuienesSomos } from "@/components/QuienesSomos";
import { Tienda } from "@/components/Tienda";
import { Contacto } from "@/components/Contacto";
import { CartDrawer } from "@/components/CartDrawer";
import { getSiteConfig } from "@/lib/site-config";

export default async function Home() {
  const { logoUrl } = await getSiteConfig();

  return (
    <main>
      <Navbar logoUrl={logoUrl} />
      <Hero />
      <QuienesSomos />
      <Tienda />
      <Contacto />
      <CartDrawer />
    </main>
  );
}
