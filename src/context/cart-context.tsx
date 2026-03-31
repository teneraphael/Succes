"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
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
  removeFromCart: (id: string, color?: string) => void; 
  updateQuantity: (id: string, newQuantity: number, color?: string) => void;
  updateColor: (id: string, oldColor: string | undefined, newColor: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Charger le panier au démarrage (Sécurité SSR)
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

  // 2. Sauvegarder à chaque changement (Uniquement après l'initialisation)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('dealcity-cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.color === item.color
      );

      if (existingItem) {
        return prev.map((i) =>
          (i.id === item.id && i.color === item.color)
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateColor = (id: string, oldColor: string | undefined, newColor: string) => {
    setCart((prev) => {
      const currentItem = prev.find(i => i.id === id && i.color === oldColor);
      if (!currentItem) return prev;

      const targetItem = prev.find(i => i.id === id && i.color === newColor);

      if (targetItem) {
        // Fusion : on ajoute la quantité de l'ancien au nouveau, puis on supprime l'ancien
        return prev
          .map(i => (i.id === id && i.color === newColor) 
            ? { ...i, quantity: i.quantity + currentItem.quantity } 
            : i
          )
          .filter(i => !(i.id === id && i.color === oldColor));
      }

      // Simple mise à jour si la couleur n'existe pas encore dans le panier
      return prev.map((item) =>
        (item.id === id && item.color === oldColor)
          ? { ...item, color: newColor }
          : item
      );
    });
  };

  const updateQuantity = (id: string, newQuantity: number, color?: string) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        (item.id === id && item.color === color)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (id: string, color?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.color === color)));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateColor, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};