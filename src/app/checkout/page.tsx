"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ArrowLeft, MapPin, Phone, User, Palette, Plus, Minus, Loader2, MessageSquare, Truck, Info } from 'lucide-react';
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
    const cleanPhone = rawPhone.replace(/\s+/g, '').replace(/^\+237/, '');

    const orderData = {
      customerName: formData.get('name'),
      customerPhone: cleanPhone,
      customerAddress: formData.get('address'),
      note: orderNote, 
      total: totalAmount,
      status: "pending_payment", // Statut à mettre à jour manuellement
      items: displayItems.map(item => ({
        postId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || "Standard",
        image: item.image
      })),
      postId: displayItems[0].id,
      quantity: displayItems[0].quantity,
      selectedColor: displayItems[0].color || "Standard",
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de la validation");

      if (result.success) {
        toast({ 
          title: "COMMANDE ENREGISTRÉE !", 
          description: "Veuillez effectuer le paiement des frais de 1000F pour valider votre commande.",
          duration: 7000,
        });
        if (!directId) clearCart();
        router.push(`/users/me?tab=orders`);
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
          <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white italic">Finaliser la commande</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-2">
        {/* SECTION PAIEMENT FRAIS */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-5 rounded-[26px] flex gap-4">
          <Info className="text-[#00b272] size-12 flex-shrink-0" />
          <div>
            <p className="text-xs font-black text-emerald-900 dark:text-emerald-100 uppercase italic">Frais de livraison : 1000 FCFA</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold mt-1">Envoyez 1000F par Mobile Money pour confirmer :</p>
            <p className="text-sm font-black text-emerald-900 dark:text-white mt-2">MTN : <span className="underline italic">673910659</span></p>
            <p className="text-sm font-black text-emerald-900 dark:text-white">ORANGE : <span className="underline italic">687305263</span></p>
          </div>
        </div>

        {/* RECAP ARTICLES */}
        <div className="bg-white dark:bg-zinc-900 rounded-[26px] border border-slate-200/60 dark:border-zinc-800/60 p-4 shadow-xs space-y-4">
            {displayItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800 flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-black text-sm uppercase truncate italic tracking-tight mb-1 text-slate-900 dark:text-white">{item.name}</h3>
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

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input required name="name" placeholder="Ton nom complet" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-slate-900 dark:text-white text-sm" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input required type="tel" name="phone" placeholder="Téléphone de contact" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-slate-900 dark:text-white text-sm" />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-5 size-5 text-slate-400" />
              <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Note pour la commande" rows={2} className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none text-slate-900 dark:text-white italic text-sm" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-5 size-5 text-slate-400" />
              <textarea required name="address" placeholder="Adresse de livraison..." rows={3} className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-slate-200/60 dark:ring-zinc-800 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none text-slate-900 dark:text-white text-sm" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || displayItems.length === 0}
            className="w-full bg-[#00b272] hover:bg-[#009a62] text-white py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin size-4" /> Enregistrement...</>
            ) : (
              "Valider la commande"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}