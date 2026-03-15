"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Interface mise à jour avec availableColors
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number; 
  color?: string;   
  availableColors?: string[]; // Ajouté pour pouvoir choisir dans le panier
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string) => void; 
  updateQuantity: (id: string, newQuantity: number, color?: string) => void;
  updateColor: (id: string, oldColor: string | undefined, newColor: string) => void; // Ajouté
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Charger le panier au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('dealcity-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur de parsing du panier", e);
      }
    }
  }, []);

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem('dealcity-cart', JSON.stringify(cart));
  }, [cart]);

  // Ajouter au panier
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

  // ✅ Nouvelle fonction : Modifier la couleur directement
  const updateColor = (id: string, oldColor: string | undefined, newColor: string) => {
    setCart((prev) => {
      // On vérifie si le produit existe déjà avec la nouvelle couleur pour fusionner
      const targetItem = prev.find(i => i.id === id && i.color === newColor);
      const currentItem = prev.find(i => i.id === id && i.color === oldColor);

      if (targetItem && currentItem) {
        // Fusion des deux lignes (ex: 1 Rouge + 1 Bleu -> devient 2 Bleu)
        return prev
          .map(i => {
            if (i.id === id && i.color === newColor) {
              return { ...i, quantity: i.quantity + currentItem.quantity };
            }
            return i;
          })
          .filter(i => !(i.id === id && i.color === oldColor));
      }

      // Simple changement de couleur sur la ligne actuelle
      return prev.map((item) =>
        (item.id === id && item.color === oldColor)
          ? { ...item, color: newColor }
          : item
      );
    });
  };

  // Mise à jour quantité
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

  // Suppression
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