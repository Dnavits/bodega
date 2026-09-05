import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCatalog } from "@/components/ProductCatalog";
import { CustomizationSection } from "@/components/CustomizationSection";
import { PaymentInfo } from "@/components/PaymentInfo";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-sand text-atelier-950 flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductCatalog />
        <CustomizationSection />
        <PaymentInfo />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
