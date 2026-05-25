"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useMemo } from 'react';
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

  // Mise à jour de la quantité
  const updateQuantity = (delta: number) => {
    setProductData((prev: any) => {
      const newQty = Math.max(1, (prev.quantity || 1) + delta);
      const updated = { ...prev, quantity: newQty };
      sessionStorage.setItem("current_product", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    const storedProduct = sessionStorage.getItem("current_product");
    if (storedProduct) setProductData(JSON.parse(storedProduct));

    const ref = searchParams.get('ref');
    if (ref && ref !== 'null') {
      fetch(`/api/payments/get-info?ref=${ref}`)
        .then(res => res.json())
        .then(data => { 
          if (data.name || data.phone) setCustomer({ name: data.name, phone: data.phone });
          if (data.product) {
            setProductData(data.product);
            sessionStorage.setItem("current_product", JSON.stringify(data.product));
          }
        });
    }
  }, [searchParams]);

  const displayItems = useMemo(() => {
    if (productData) return [productData];
    if (cart && cart.length > 0) return cart;
    return [];
  }, [productData, cart]);

  // Calcul du total global
  const totalAmount = useMemo(() => 
    displayItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity || 1)), 0),
    [displayItems]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || displayItems.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const finalOrder = {
      customerName: formData.get('name'),
      customerPhone: formData.get('phone'),
      customerAddress: formData.get('address'),
      note: orderNote,
      items: displayItems.map(item => ({ ...item, postId: item.id })),
      total: totalAmount,
      paymentId: searchParams.get('ref') || "direct",
      deliveryFeePaid: true 
    };

    try {
      const res = await fetch("/api/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder)
      });
      if (!res.ok) throw new Error("Erreur serveur");
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
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="size-6 text-slate-600" />
          </button>
          <h1 className="font-extrabold uppercase italic tracking-tight">Finalisation</h1>
          <div className="w-10"></div> {/* Pour centrer le titre */}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Section Produit */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Votre panier</h2>
          {displayItems.length > 0 ? displayItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-center">
              <div className="relative size-24 rounded-2xl overflow-hidden bg-slate-100 border flex-shrink-0">
                {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized /> : <div className="w-full h-full bg-slate-200" />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-base leading-tight">{item.name}</h3>
                <p className="text-[#00b272] font-black text-sm">
                  {item.quantity} x {Number(item.price).toLocaleString()} FCFA
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <button type="button" onClick={() => updateQuantity(-1)} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200"><Minus className="size-4" /></button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(1)} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          )) : <p className="text-center py-4">Chargement...</p>}
        </div>

        {/* Section Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informations de livraison</h2>
          
          <div className="space-y-4">
            <input required name="name" defaultValue={customer.name} placeholder="Nom complet" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none focus:ring-2 focus:ring-[#00b272]/20" />
            <input required type="tel" name="phone" defaultValue={customer.phone} placeholder="Numéro de téléphone" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none focus:ring-2 focus:ring-[#00b272]/20" />
            <textarea required name="address" placeholder="Adresse complète..." rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none focus:ring-2 focus:ring-[#00b272]/20 resize-none" />
            <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Note additionnelle (optionnel)" rows={1} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 font-medium outline-none focus:ring-2 focus:ring-[#00b272]/20 resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#00b272] text-white py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-[#00b272]/30 hover:scale-[0.98] transition-all">
            {isSubmitting ? "Traitement..." : `valider ${totalAmount.toLocaleString()} FCFA`}
          </button>
          
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            vous receverez un appel du livreur
          </p>
        </form>
      </div>
    </div>
  );
}