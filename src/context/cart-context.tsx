"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  stock: boolean;
  id: string;
  postId: string;
  variantId?: string | null;
  selectedOptions?: string;
  name: string;
  price: number;
  image: string;
  quantity: number; 
  color?: string;
  availableColors?: string[]; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variantId?: string | null, color?: string) => void; 
  updateQuantity: (id: string, newQuantity: number, variantId?: string | null, color?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('dealcity-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur de parsing du panier", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('dealcity-cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const isSameItem = (itemA: CartItem, id: string, variantId?: string | null, color?: string) => {
    return itemA.id === id && 
           (itemA.variantId || null) === (variantId || null) && 
           (itemA.color || "Standard") === (color || "Standard");
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => isSameItem(i, item.id, item.variantId, item.color));
      if (existingItem) {
        return prev.map((i) =>
          isSameItem(i, item.id, item.variantId, item.color)
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, newQuantity: number, variantId?: string | null, color?: string) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        isSameItem(item, id, variantId, color) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string, variantId?: string | null, color?: string) => {
    setCart((prev) => prev.filter((item) => !isSameItem(item, id, variantId, color)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('dealcity-cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};