"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useMemo } from 'react';
import { ArrowLeft, User, Phone, MapPin, MessageSquareText, ShieldCheck, Truck } from 'lucide-react';
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
  const { cart, clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const ref = searchParams.get('ref') || "";
  const p_data = searchParams.get('p_data') || "";
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState(""); 
  const [productData, setProductData] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    setIsMounted(true);
    const savedCustomer = sessionStorage.getItem("checkout_customer_data");
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error("Erreur lecture données client:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (customer.name || customer.phone || customer.address) {
      sessionStorage.setItem("checkout_customer_data", JSON.stringify(customer));
    }
  }, [customer]);

  useEffect(() => {
    if (p_data) {
      try {
        const decoded = JSON.parse(Buffer.from(p_data, 'base64').toString('utf-8'));
        setProductData(Array.isArray(decoded) ? decoded : [decoded]);
      } catch (e) {
        console.error("Erreur décodage p_data:", e);
      }
    } else if (ref && ref !== 'null') {
      fetch(`/api/payments/get-info?ref=${ref}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => { 
          if (data.product) {
            const arr = Array.isArray(data.product) ? data.product : [data.product];
            setProductData(arr);
          }
        })
        .catch(console.error);
    }
  }, [ref, p_data]);

  const displayItems = useMemo(() => {
    return productData.length > 0 ? productData : (cart || []);
  }, [productData, cart]);

  const totalAmount = useMemo(() => 
    displayItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0),
    [displayItems]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || displayItems.length === 0) return;
    setIsSubmitting(true);
    
    // 1. Vérification préventive du stock avant de lancer la création
    try {
      const checkRes = await fetch("/api/orders/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: displayItems })
      });
      
      const stockStatus = await checkRes.json();
      if (!stockStatus.valid) {
        throw new Error(stockStatus.message || "Stock insuffisant pour un des articles.");
      }

      // 2. Si le stock est bon, on envoie la commande
      const finalOrder = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        note: orderNote,
        items: displayItems.map(item => ({ 
          id: String(item.id || item.postId || ""),
          postId: String(item.postId || item.id || ""), 
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          color: (item.color && item.color !== "undefined") ? item.color : "Standard",
          selectedOptions: (item.selectedOptions && item.selectedOptions !== "undefined") ? item.selectedOptions : "Aucune option"
        })),
        total: Number(totalAmount),
        paymentId: ref || "direct"
      };

      const res = await fetch("/api/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la validation");
      }

      clearCart();
      sessionStorage.removeItem("checkout_customer_data");
      router.push("/users/me?tab=orders");
    } catch (error: any) {
      toast({ variant: "destructive", title: "ERREUR", description: error.message });
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 font-sans">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="size-6 text-neutral-700" />
          </button>
          <h1 className="ml-4 font-black uppercase tracking-tight text-lg text-neutral-900">Finaliser ma commande</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-neutral-400">
            <Truck className="size-4" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Récapitulatif</h2>
          </div>
          {displayItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-start mb-4">
              <div className="relative size-20 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 leading-tight">{item.name}</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] font-bold uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">{item.color || "Standard"}</span>
                  <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">{item.selectedOptions || "Option standard"}</span>
                </div>
                <p className="text-neutral-900 font-black text-xs pt-1">{item.quantity} x {Number(item.price).toLocaleString()} FCFA</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Informations de livraison</label>
            <div className="relative">
              <User className="absolute left-4 top-4 size-4 text-neutral-400" />
              <input required name="name" value={customer.name} onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))} placeholder="Nom complet" className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-4 size-4 text-neutral-400" />
              <input required type="tel" name="phone" value={customer.phone} onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))} placeholder="Téléphone" className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 size-4 text-neutral-400" />
              <textarea required name="address" value={customer.address} onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))} placeholder="Adresse complète..." rows={2} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="relative">
              <MessageSquareText className="absolute left-4 top-4 size-4 text-neutral-400" />
              <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Note additionnelle (optionnel)" rows={1} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="size-4" />
            {isSubmitting ? "Traitement..." : `Valider ${totalAmount.toLocaleString()} FCFA`}
          </button>
        </form>
      </div>
    </div>
  );
}