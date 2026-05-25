"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black uppercase italic text-gray-400">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState(""); 
  const [productData, setProductData] = useState<any>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  // CORRECTION : On s'assure de conserver TOUTES les propriétés (dont la couleur) lors de la mise à jour
  const updateQuantity = useCallback((delta: number) => {
    setProductData((prev: any) => {
      if (!prev) return prev;
      const newQty = Math.max(1, (parseInt(prev.quantity) || 1) + delta);
      // On décompose 'prev' pour garder la couleur, et on écrase seulement la quantité
      const updated = { ...prev, quantity: newQty };
      
      sessionStorage.setItem("current_product", JSON.stringify(updated));
      return updated; 
    });
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const storedProduct = sessionStorage.getItem("current_product");
    if (storedProduct) {
      try {
        setProductData(JSON.parse(storedProduct));
      } catch (e) {
        console.error("Erreur parsing storage", e);
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
  }, [searchParams, customer.phone]); 

  const displayItems = useMemo(() => {
    if (productData) return [productData];
    if (cart && cart.length > 0) return cart;
    return [];
  }, [productData, cart]);

  const totalAmount = useMemo(() => 
    displayItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity || 1)), 0),
    [displayItems]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || displayItems.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Construction explicite des items en forçant les valeurs de l'état actuel
    const finalOrder = {
      customerName: formData.get('name'),
      customerPhone: formData.get('phone'),
      customerAddress: formData.get('address'),
      note: orderNote,
      items: displayItems.map(item => ({ 
        id: item.id,
        postId: item.id,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        // On récupère bien la couleur de l'objet item qui est dans l'état 'productData'
        color: item.color || "Standard" 
      })),
      total: totalAmount,
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
        throw new Error(errorData.error || "Erreur serveur");
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
    // ... reste du JSX identique
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* ... header ... */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft className="size-6 text-slate-600" /></button>
          <h1 className="font-extrabold uppercase italic tracking-tight">Finalisation</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Votre panier</h2>
          {displayItems.length > 0 ? displayItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-center">
              <div className="relative size-24 rounded-2xl overflow-hidden bg-slate-100 border flex-shrink-0">
                {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized /> : <div className="w-full h-full bg-slate-200" />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-base leading-tight">{item.name}</h3>
                <p className="text-[10px] font-black uppercase text-slate-400">Couleur : {item.color || "Standard"}</p>
                <p className="text-[#00b272] font-black text-sm">{item.quantity} x {Number(item.price).toLocaleString()} FCFA</p>
                <div className="flex items-center gap-4 mt-3">
                  <button type="button" onClick={() => updateQuantity(-1)} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200"><Minus className="size-4" /></button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(1)} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          )) : <p className="text-center py-4">Chargement...</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
           {/* ... tes inputs ... */}
           <input required name="name" defaultValue={customer.name} placeholder="Nom complet" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none" />
           <input required type="tel" name="phone" defaultValue={customer.phone} placeholder="Numéro de téléphone" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none" />
           <textarea required name="address" placeholder="Adresse complète..." rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none resize-none" />
           <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Note additionnelle" rows={1} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none resize-none" />
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#00b272] text-white py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-[#00b272]/30 hover:scale-[0.98] transition-all">
            {isSubmitting ? "Traitement..." : `valider ${totalAmount.toLocaleString()} FCFA`}
          </button>
        </form>
      </div>
    </div>
  );
}