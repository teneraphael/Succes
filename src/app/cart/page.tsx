"use client";

import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, ChevronRight, Plus, Minus, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity, updateColor } = useCart();
  const router = useRouter();

  // Calcul du total sécurisé
  const total = cart?.reduce((acc, item) => {
    const price = item.price || 0;
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0) || 0;

  // État panier vide
  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-white dark:bg-zinc-950 transition-colors">
        <div className="size-24 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-zinc-800">
          <ShoppingBag className="size-9 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2 dark:text-white italic">Votre panier est vide</h2>
        <p className="text-muted-foreground dark:text-zinc-400 mb-8 max-w-[260px] text-xs leading-relaxed">
          Ajoutez des articles pour profiter des meilleurs deals et exclusivités au Cameroun.
        </p>
        <Link 
          href="/" 
          className="bg-[#00b272] hover:bg-[#009a62] text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs tracking-wider shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
        >
          Découvrir les deals
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-40 transition-colors font-sans">
      
      {/* HEADER DE LA PAGE */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/80 sticky top-0 z-10 px-4 py-5 transition-colors shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition text-slate-800 dark:text-zinc-200"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tight dark:text-white italic">Mon Panier</h1>
          <button 
            onClick={() => {
              if (confirm("Vider tout le panier ?")) clearCart();
            }} 
            className="text-[10px] font-extrabold uppercase bg-red-50 dark:bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl active:bg-red-100 dark:active:bg-red-500/20 transition-all border border-red-100/60 dark:border-red-500/10"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-2">
        <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest px-1 italic">
          {cart.length} {cart.length > 1 ? 'Articles ajoutés' : 'Article ajouté'}
        </p>

        {/* LISTE DES ARTICLES */}
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div 
              key={`${item.id}-${item.color || index}`} 
              className="group flex flex-col bg-white dark:bg-zinc-900 p-4 rounded-[26px] border border-slate-200/60 dark:border-zinc-800/60 shadow-xs hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Image de l'article */}
                <div className="relative size-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800 flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.name || "Produit"} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="text-slate-300 dark:text-zinc-600 size-6" />
                    </div>
                  )}
                </div>
                
                {/* Métadonnées de l'article */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[96px]">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100 truncate uppercase tracking-tight italic w-full">
                        {item.name || "Article sans nom"}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.id, item.color)}
                        className="p-1 -mr-1 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {/* Sélection des variantes de couleurs */}
                    {item.availableColors && item.availableColors.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                          Couleur : <span className="text-slate-800 dark:text-zinc-300 italic font-black">{item.color || 'Standard'}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.availableColors.map((c: string) => (
                            <button
                              key={c}
                              onClick={() => updateColor(item.id, item.color, c)}
                              className={cn(
                                "size-4 rounded-full border border-white dark:border-zinc-900 ring-2 ring-transparent transition-all shadow-xs",
                                item.color === c 
                                  ? 'scale-110 shadow-sm ring-black dark:ring-zinc-400' 
                                  : 'opacity-40 hover:opacity-100'
                              )}
                              style={{ backgroundColor: c.toLowerCase() }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-3 gap-2">
                    {/* Prix */}
                    <p className="text-[#00b272] font-black text-lg tracking-tight leading-none italic">
                      {(item.price || 0).toLocaleString('fr-FR')} <span className="text-[10px] not-italic font-bold">FCFA</span>
                    </p>

                    {/* Contrôle des Quantités */}
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1, item.color)}
                        className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-xs hover:bg-slate-100 dark:hover:bg-zinc-600 active:scale-90 transition disabled:opacity-30 text-slate-700 dark:text-zinc-200"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-black text-xs min-w-[16px] text-center text-slate-900 dark:text-zinc-100">
                        {item.quantity || 1}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1, item.color)}
                        className="size-7 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-xs hover:bg-slate-100 dark:hover:bg-zinc-600 active:scale-90 transition text-slate-700 dark:text-zinc-200"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER FIXE : RÉSUMÉ DE LA COMMANDE */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-zinc-800/80 p-5 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] z-50 transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-end px-1">
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Total à payer</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none platform-total italic">
                {total.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#00b272]">FCFA</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-extrabold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-lg uppercase italic border border-orange-100/50 dark:border-orange-500/10 flex items-center gap-1">
                <Truck className="size-3" /> Cash On Delivery
              </span>
              <span className="text-[8px] font-medium text-slate-400 dark:text-zinc-500 italic">Paiement direct à la livraison</span>
            </div>
          </div>
          
          {/* 🟢 Bouton harmonisé avec le vert d'action de DealCity */}
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-[#00b272] hover:bg-[#009a62] text-white py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Valider la commande</span>
            <ChevronRight className="size-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}