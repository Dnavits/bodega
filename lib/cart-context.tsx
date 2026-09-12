"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
  id:       string;
  nombre:   string;
  precio:   number;
  imagen:   string;
  cantidad: number;
  stock?:   number;
};

type CartContextType = {
  items:          CartItem[];
  isOpen:         boolean;
  setIsOpen:      (open: boolean) => void;
  addItem:        (item: Omit<CartItem, "cantidad">) => void;
  removeItem:     (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart:      () => void;
  total:          number;
  count:          number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "bodega_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,  setItems]  = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Hydrate from localStorage on mount ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  // ── Persist to localStorage whenever items change ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore quota errors */ }
  }, [items, hydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, "cantidad">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        const maxStock = newItem.stock ?? existing.stock;
        if (maxStock !== undefined && existing.cantidad >= maxStock) {
          return prev;
        }
        return prev.map(i =>
          i.id === newItem.id ? { ...i, cantidad: i.cantidad + 1, stock: maxStock } : i
        );
      }
      return [...prev, { ...newItem, cantidad: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev =>
        prev.map(i => {
          if (i.id !== id) return i;
          const maxStock = i.stock;
          const finalCantidad = maxStock !== undefined ? Math.min(cantidad, maxStock) : cantidad;
          return { ...i, cantidad: finalCantidad };
        })
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQuantity, clearCart,
      total, count,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
