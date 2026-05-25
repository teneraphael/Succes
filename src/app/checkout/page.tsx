"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black uppercase italic text-muted-foreground">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart, updateQuantity: updateCartQuantity } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState(""); 
  const [productData, setProductData] = useState<any>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  // 1. Logique de priorité : Panier d'abord, sinon produit unique
  const displayItems = useMemo(() => {
    if (cart && cart.length > 0) return cart;
    if (productData) return [productData];
    return [];
  }, [productData, cart]);

  const totalAmount = useMemo(() => 
    displayItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0),
    [displayItems]
  );

  // 2. Gestion unifiée des quantités
  const handleUpdateQty = useCallback((item: any, delta: number) => {
    if (cart && cart.length > 0) {
      updateCartQuantity(item.id, Math.max(1, (item.quantity || 1) + delta), item.color);
    } else if (productData) {
      const newQty = Math.max(1, (parseInt(productData.quantity) || 1) + delta);
      const updated = { ...productData, quantity: newQty };
      setProductData(updated);
      sessionStorage.setItem("current_product", JSON.stringify(updated));
    }
  }, [cart, productData, updateCartQuantity]);

  useEffect(() => {
    setIsMounted(true);
    
    // Charger le produit unique uniquement si le panier est vide
    if (!cart || cart.length === 0) {
      const storedProduct = sessionStorage.getItem("current_product");
      if (storedProduct) {
        try { setProductData(JSON.parse(storedProduct)); } catch (e) { console.error(e); }
      }
    }

    const ref = searchParams.get('ref');
    if (ref && ref !== 'null' && !customer.phone) {
      fetch(`/api/payments/get-info?ref=${ref}`)
        .then(res => res.json())
        .then(data => { 
          if (data.name || data.phone) setCustomer({ name: data.name, phone: data.phone });
          if (data.product) {
            setProductData(data.product);
            sessionStorage.setItem("current_product", JSON.stringify(data.product));
          }
        })
        .catch(console.error);
    }
  }, [searchParams, cart, customer.phone]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || displayItems.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Normalisation stricte des données avant envoi
    const finalOrder = {
      customerName: formData.get('name'),
      customerPhone: formData.get('phone'),
      customerAddress: formData.get('address'),
      note: orderNote,
      items: displayItems.map(item => ({ 
        id: String(item.id),
        postId: String(item.id),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        color: item.color || "Standard" 
      })),
      total: Number(totalAmount),
      paymentId: searchParams.get('ref') || "direct"
    };

    try {
      const res = await fetch("/api/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la validation");
      }

      sessionStorage.removeItem("current_product");
      toast({ title: "SUCCÈS", description: "Commande envoyée !" });
      router.push("/users/me?tab=orders");
    } catch (error: any) {
      toast({ variant: "destructive", title: "ERREUR", description: error.message });
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen text-foreground bg-background pb-24 font-sans">
      <div className="bg-card border-b border-border sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"><ArrowLeft className="size-6" /></button>
          <h1 className="font-extrabold uppercase italic tracking-tight">Finalisation</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Votre panier</h2>
          {displayItems.length > 0 ? displayItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-center">
              <div className="relative size-24 rounded-2xl overflow-hidden bg-muted border flex-shrink-0">
                {item.image ? <Image src={item.image} alt={item.name || "Produit"} fill className="object-cover" unoptimized /> : <div className="w-full h-full bg-muted" />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-base leading-tight">{item.name || "Article"}</h3>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Couleur : {item.color || "Standard"}</p>
                <p className="text-emerald-500 font-black text-sm">{item.quantity} x {Number(item.price || 0).toLocaleString()} FCFA</p>
                <div className="flex items-center gap-4 mt-3">
                  <button type="button" onClick={() => handleUpdateQty(item, -1)} className="bg-muted p-2 rounded-lg hover:bg-muted/80"><Minus className="size-4" /></button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => handleUpdateQty(item, 1)} className="bg-foreground text-background p-2 rounded-lg hover:opacity-90"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          )) : <p className="text-center py-4 text-muted-foreground">Panier vide</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5">
           <input required name="name" defaultValue={customer.name} placeholder="Nom complet" className="w-full bg-background border border-border rounded-2xl py-4 px-5 font-medium outline-none" />
           <input required type="tel" name="phone" defaultValue={customer.phone} placeholder="Numéro de téléphone" className="w-full bg-background border border-border rounded-2xl py-4 px-5 font-medium outline-none" />
           <textarea required name="address" placeholder="Adresse complète..." rows={2} className="w-full bg-background border border-border rounded-2xl py-4 px-5 font-medium outline-none resize-none" />
           <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Note additionnelle" rows={1} className="w-full bg-background border border-border rounded-2xl py-4 px-5 font-medium outline-none resize-none" />
          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-lg hover:scale-[0.98] transition-all">
            {isSubmitting ? "Traitement..." : `valider ${totalAmount.toLocaleString()} FCFA`}
          </button>
        </form>
      </div>
    </div>
  );
}