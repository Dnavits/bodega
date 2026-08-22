"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenes: string[];
};

const formVacio = {
  nombre: "",
  precio: "",
  stock: "",
  categoria: "gaseosas",
  imagen_url_1: "",
  imagen_url_2: "",
  imagen_url_3: ""
};

export default function AdminProductos() {
  const supabase = createClient();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState("");

  async function cargar() {
    const { data } = await supabase.from("productos").select("*").order("categoria");
    setProductos(data || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.precio || !form.stock) {
      setError("Completa nombre, precio y stock.");
      return;
    }
    const res = await fetch("/api/admin/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo agregar el producto.");
      return;
    }
    setForm(formVacio);
    cargar();
  }

  async function eliminar(id: string) {
    await fetch("/api/admin/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Productos</h1>
        <a href="/admin/configuracion" className="text-sm text-bottle font-medium underline">
          Logo y favicon →
        </a>
      </div>

      <form onSubmit={agregar} className="bg-white border border-charcoal/10 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm col-span-2" />
          <input placeholder="Precio" type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
        </div>
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm mb-3 w-full md:w-auto">
          <option value="gaseosas">Gaseosas</option>
          <option value="agua">Agua</option>
          <option value="cervezas">Cervezas</option>
          <option value="otros">Otros</option>
        </select>
        <p className="text-xs text-charcoal/50 mb-2">Fotos del producto (mínimo 1, máximo 3)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input placeholder="URL foto 1" value={form.imagen_url_1} onChange={(e) => setForm({ ...form, imagen_url_1: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="URL foto 2 (opcional)" value={form.imagen_url_2} onChange={(e) => setForm({ ...form, imagen_url_2: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="URL foto 3 (opcional)" value={form.imagen_url_3} onChange={(e) => setForm({ ...form, imagen_url_3: e.target.value })} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-bottle hover:bg-bottle-dark transition-colors text-white text-sm font-medium rounded-lg py-2 px-6">
          Agregar producto
        </button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </form>

      <div className="bg-white border border-charcoal/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-left text-charcoal/60">
              <th className="p-3">Producto</th>
              <th className="p-3">Fotos</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b border-charcoal/5 last:border-0">
                <td className="p-3">{p.nombre}</td>
                <td className="p-3">{p.imagenes?.length ?? 0}</td>
                <td className="p-3">${p.precio.toLocaleString("es-CO")}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right">
                  <button onClick={() => eliminar(p.id)} className="text-red-600 text-xs font-medium">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
