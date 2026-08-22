import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "./ProductCard";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  categoria: string;
  stock: number;
};

export async function Tienda() {
  const supabase = await createClient();
  let productos: Producto[] = [];
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, imagenes, categoria, stock")
      .eq("activo", true)
      .order("categoria");
    if (error) throw error;
    productos = data || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <section id="tienda" className="max-w-6xl mx-auto px-5 md:px-6 py-14 md:py-20">
      <div className="text-center mb-10 md:mb-12">
        <span className="text-soda font-semibold text-sm">Tienda</span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-2">Nuestros productos</h2>
      </div>

      {!productos || productos.length === 0 ? (
        <p className="text-center text-charcoal/60">
          Todavía no hay productos cargados. Agrégalos desde el panel de administración.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </section>
  );
}
