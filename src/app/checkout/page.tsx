"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ArrowLeft, MapPin, Phone, User, Palette, Plus, Minus, Loader2, MessageSquare, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black uppercase italic text-gray-400 dark:text-zinc-600">Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart, updateQuantity, clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState(""); 

  const isConfirmed = searchParams.get('step') === 'confirm';
  const orderId = searchParams.get('orderId');

  const directId = searchParams.get('directId');
  const [directQty, setDirectQty] = useState(Number(searchParams.get('qty')) || 1);
  const selectedColor = searchParams.get('color') || null;

  const displayItems = directId ? [{
    id: directId,
    name: searchParams.get('name') || "Produit DealCity",
    price: Number(searchParams.get('price')) || 0,
    image: searchParams.get('image') || "",
    quantity: directQty,
    color: selectedColor,
  }] : cart;

  const totalAmount = displayItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const handleQtyChange = (id: string, currentQty: number, color: string | null | undefined, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (directId) setDirectQty(newQty);
    else updateQuantity(id, newQty, color || undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (displayItems.length === 0) {
      toast({ variant: "destructive", description: "Votre panier est vide." });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const rawPhone = formData.get('phone') as string;
    const cleanPhone = rawPhone.replace(/\s+/g, '').replace(/^\+237/, '').replace(/^0/, '');
    const fullPhone = `237${cleanPhone}`;

    try {
      if (!isConfirmed) {
        // ÉTAPE 1 : Enregistrement et Paiement des frais
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            customerName: formData.get('name'),
            customerPhone: fullPhone,
            items: displayItems,
            total: totalAmount 
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erreur lors de la validation");

        const paymentRes = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.orderId, phoneNumber: fullPhone }),
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok) throw new Error("Erreur lors de l'initialisation du paiement");

        toast({ title: "PAIEMENT INITIÉ", description: `Composez ${paymentData.ussd_code} pour payer.` });
        
        router.push(`/checkout?step=confirm&orderId=${result.orderId}&directId=${directId || ''}&qty=${directQty}&name=${displayItems[0].name}&price=${displayItems[0].price}&image=${encodeURIComponent(displayItems[0].image)}&color=${selectedColor || ''}`);
      } else {
        // ÉTAPE 2 : Finalisation de la commande
        const finalOrder = {
          orderId,
          customerName: formData.get('name'),
          customerPhone: fullPhone,
          customerAddress: formData.get('address'),
          note: orderNote,
          items: displayItems
        };

        const res = await fetch("/api/orders/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalOrder),
        });

        if (!res.ok) throw new Error("Erreur lors de la finalisation");
        
        clearCart();
        router.push("/users/me?tab=orders");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "ERREUR", description: error.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-20 transition-colors font-sans">
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/80 sticky top-0 z-10 px-4 py-5 transition-colors shadow-xs">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition">
            <ArrowLeft className="size-5 text-slate-800 dark:text-zinc-200" />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white italic">
            {isConfirmed ? "Confirmer la commande" : "Finaliser et Payer"}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-2">
        <div className="bg-white dark:bg-zinc-900 rounded-[26px] border border-slate-200/60 dark:border-zinc-800/60 p-4 shadow-xs space-y-4">
            {displayItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800 flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-black text-sm uppercase truncate italic tracking-tight mb-1 text-slate-900 dark:text-white">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {item.color && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md border border-blue-100/60 dark:border-blue-500/10 uppercase italic">
                        <Palette className="size-2.5" /> {item.color}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <button type="button" onClick={() => handleQtyChange(item.id, item.quantity, item.color, -1)} className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-xs active:scale-90" disabled={item.quantity <= 1}>
                        <Minus className="size-3 text-slate-700 dark:text-zinc-200" />
                      </button>
                      <span className="font-black text-xs px-1 min-w-[16px] text-center text-slate-900 dark:text-zinc-100">{item.quantity}</span>
                      <button type="button" onClick={() => handleQtyChange(item.id, item.quantity, item.color, 1)} className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-xs active:scale-90">
                        <Plus className="size-3 text-slate-700 dark:text-zinc-200" />
                      </button>
                    </div>
                    <p className="text-[#00b272] font-black text-base italic">
                      {(item.price * (item.quantity || 1)).toLocaleString('fr-FR')} <span className="text-[9px] not-italic font-bold">FCFA</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input required name="name" placeholder="Ton nom complet" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-slate-900 dark:text-white text-sm" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input required type="tel" name="phone" placeholder="Ton numéro de téléphone" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-slate-900 dark:text-white text-sm" />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-5 size-5 text-slate-400" />
              <textarea 
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Comment voulez-vous votre commande ?" 
                rows={2} 
                className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none text-slate-900 dark:text-white italic text-sm" 
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-5 size-5 text-slate-400" />
              <textarea required name="address" placeholder="Adresse de livraison..." rows={3} className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none text-slate-900 dark:text-white text-sm" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00b272] hover:bg-[#009a62] text-white py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin size-4" /> Traitement...</>
            ) : isConfirmed ? (
              "COMMANDER"
            ) : (
              "PAYER LES FRAIS DE LIVRAISON"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}