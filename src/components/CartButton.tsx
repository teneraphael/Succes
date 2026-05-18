"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context"; // Utilise ton vrai chemin vers le contexte

export default function CartButton() {
  const { cart } = useCart();

  // On calcule le nombre total d'articles (prend en compte les quantités)
  const itemCount = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  return (
    <Link 
      href="/cart" 
      aria-label="Mon Panier"
      className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors active:scale-90 relative"
    >
      <ShoppingBag className="size-5" />
      
      {/* La pastille rouge s'affiche instantanément dès qu'il y a un produit */}
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white ring-2 ring-background animate-in zoom-in duration-200">
          {itemCount}
        </span>
      )}
    </Link>
  );
}