"use client";

import { useCart } from '@/context/cart-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ArrowLeft, MapPin, Phone, User, CheckCircle2, ShieldCheck, Palette, Plus, Minus, Loader2 } from 'lucide-react';
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
  const { cart, updateQuantity } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const directId = searchParams.get('directId');
  const [directQty, setDirectQty] = useState(Number(searchParams.get('qty')) || 1);

  const displayItems = directId ? [{
    id: directId,
    name: searchParams.get('name') || "Produit DealCity",
    price: Number(searchParams.get('price')) || 0,
    image: searchParams.get('image') || "",
    quantity: directQty,
    color: searchParams.get('color') || null,
  }] : cart;

  const totalAmount = displayItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const handleQtyChange = (id: string, currentQty: number, color: string | null | undefined, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    if (directId) {
      setDirectQty(newQty);
    } else {
      updateQuantity(id, newQty, color || undefined);
    }
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
      postId: displayItems[0].id,
      price: totalAmount,
      name: formData.get('name'),
      phone: cleanPhone,
      address: formData.get('address'),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402 || result.error?.toLowerCase().includes("solde")) {
          toast({ 
            variant: "destructive", 
            title: "SOLDE INSUFFISANT ⚠️",
            description: "Votre compte n'a pas assez de fonds (prévoyez les frais). Rechargez et réessayez.",
            duration: 8000,
          });
        } else {
          toast({ 
            variant: "destructive", 
            title: "ÉCHEC DU PAIEMENT",
            description: result.error || "Une erreur est survenue lors de l'initialisation." 
          });
        }
        return; 
      }

      if (result.url) {
        window.location.href = result.url;
      } else if (result.success) {
        const isOrange = /^(69|655|656|657|658|659)/.test(cleanPhone);

        toast({ 
          title: "ACTION REQUISE ✅",
          description: isOrange 
            ? `Validez sur votre écran ou composez le #150*50# pour payer ${totalAmount} FCFA.`
            : `Saisissez votre code PIN sur le message push reçu pour payer ${totalAmount} FCFA.`,
          duration: 15000,
        });
        
        setTimeout(() => {
            router.push(`/users/me?tab=orders`);
        }, 8000);
      }

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "ERREUR RÉSEAU",
        description: "Impossible de joindre le service de paiement." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-20 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-white/10 sticky top-0 z-10 px-4 py-6 transition-colors">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <ArrowLeft className="size-6 text-black dark:text-white" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Paiement Sécurisé</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        <div className="space-y-3">
          <p className="text-[11px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest px-1">
            {directId ? "Achat immédiat" : "Votre Panier"}
          </p>
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/10 p-4 shadow-sm space-y-4">
            {displayItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-800 flex-shrink-0 border border-black/5 dark:border-white/5">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-[11px] uppercase truncate leading-tight mb-1 text-black dark:text-white">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {item.color && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-[#4a90e2] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-500/20 uppercase">
                        <Palette className="size-2.5" /> {item.color}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl border border-black/5 dark:border-white/5">
                      <button 
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity, item.color, -1)}
                        className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-sm active:scale-90 transition disabled:opacity-30 dark:disabled:opacity-20"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-3 text-black dark:text-white" />
                      </button>
                      <span className="font-black text-xs px-1 min-w-[20px] text-center text-black dark:text-white">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity, item.color, 1)}
                        className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-sm active:scale-90 transition"
                      >
                        <Plus className="size-3 text-black dark:text-white" />
                      </button>
                    </div>
                    <p className="text-[#6ab344] font-black text-base italic">
                      {(item.price * (item.quantity || 1)).toLocaleString()} <span className="text-[9px]">FCFA</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest dark:text-zinc-500">Montant à régler</span>
            <span className="bg-blue-100 dark:bg-blue-500/10 text-[#4a90e2] dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-md uppercase italic border border-blue-200 dark:border-blue-500/20 flex items-center gap-1">
                <ShieldCheck className="size-3" /> Mobile Money
            </span>
          </div>
          <p className="text-4xl font-black tracking-tighter text-black dark:text-white">{totalAmount.toLocaleString()} <span className="text-sm">FCFA</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[11px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest px-1">Adresse de livraison</p>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-zinc-600" />
              <input required name="name" placeholder="Ton nom complet" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#4a90e2] outline-none transition-all shadow-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-zinc-600" />
              <input required type="tel" name="phone" placeholder="Numéro Mobile Money (6xxxx...)" className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#4a90e2] outline-none transition-all shadow-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-5 size-5 text-gray-400 dark:text-zinc-600" />
              <textarea required name="address" placeholder="Ville, Quartier et indications précises..." rows={3} className="w-full bg-white dark:bg-zinc-900 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl py-5 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#4a90e2] outline-none transition-all shadow-sm resize-none text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600" />
            </div>
          </div>

          <div className="p-5 bg-green-50 dark:bg-green-500/5 rounded-2xl border border-green-100 dark:border-green-500/10 flex gap-4 items-start">
            <CheckCircle2 className="size-6 text-[#6ab344] flex-shrink-0" />
            <p className="text-[12px] text-green-700 dark:text-green-500 font-bold leading-snug italic">
              Paiement sécurisé : Votre argent est conservé par DealCity jusqu&apos;à confirmation de la livraison.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || displayItems.length === 0}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-6 rounded-[2.5rem] font-black text-base uppercase italic tracking-widest shadow-xl active:scale-95 transition flex items-center justify-center gap-3 disabled:opacity-50 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Lancement...
              </>
            ) : (
              "Payer maintenant"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}