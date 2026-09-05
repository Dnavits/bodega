"use client";

import React, { useState, useMemo } from 'react';
import { ProductCard, ProductItem } from './ProductCard';
import { ProductModal } from './ProductModal';
import { CATEGORIES, PRODUCTS } from '@/data/products';

export function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="coleccion" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-atelier-700 font-bold text-xs uppercase tracking-[0.2em] inline-block mb-2">
          Catálogo Exclusivo · Confección a Mano
        </span>
        <h2 className="font-roboto font-black text-3xl sm:text-5xl text-atelier-950 tracking-tight">
          Nuestra Colección Floral
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
          Cada flor es moldeada individualmente en satín premium. Selecciona tu diseño favorito y personaliza los colores a tu gusto.
        </p>
      </div>

      {/* Category Tabs (Shopify luxury style) */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex p-1.5 bg-atelier-100/70 backdrop-blur-sm rounded-2xl border border-atelier-200/80 gap-1.5 shadow-sm">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-atelier-900 text-white shadow-md'
                    : 'text-atelier-900/80 hover:text-atelier-950 hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenModal={(item) => setSelectedProduct(item)}
          />
        ))}
      </div>

      {/* Empty State Fallback (safety) */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white border border-atelier-200 rounded-2xl p-8">
          <p className="text-gray-600 font-medium">No se encontraron productos en esta categoría.</p>
          <button
            onClick={() => setSelectedCategory("Todos")}
            className="mt-4 text-xs font-bold text-atelier-700 underline"
          >
            Ver todos los productos
          </button>
        </div>
      )}

      {/* Modal with clean key mount */}
      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
