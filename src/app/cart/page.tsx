"use client";

import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, ChevronRight, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
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

  // État vide
  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-white dark:bg-zinc-950 transition-colors">
        <div className="size-24 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="size-10 text-gray-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 dark:text-white italic">Ton panier est vide</h2>
        <p className="text-muted-foreground dark:text-zinc-500 mb-8 max-w-[250px] text-sm">
          Ajoute des articles pour profiter des meilleurs deals au Cameroun.
        </p>
        <Link 
          href="/" 
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-black uppercase italic text-sm shadow-lg active:scale-95 transition"
        >
          Découvrir les deals
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-40 transition-colors font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-white/10 sticky top-0 z-10 px-4 py-6 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition text-foreground dark:text-white"
          >
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter dark:text-white italic">Mon Panier</h1>
          <button 
            onClick={() => {
              if(confirm("Vider tout le panier ?")) clearCart();
            }} 
            className="text-[10px] font-black uppercase bg-red-50 dark:bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg active:bg-red-100 dark:active:bg-red-500/20 transition border border-red-100 dark:border-red-500/20"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">
        <p className="text-[11px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest px-1 italic">
          {cart.length} {cart.length > 1 ? 'Articles' : 'Article'} au total
        </p>

        <div className="space-y-4">
          {cart.map((item, index) => (
            <div 
              key={`${item.id}-${item.color || index}`} 
              className="group flex flex-col bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="relative size-24 rounded-[1.5rem] overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 border border-black/5 dark:border-white/5">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.name || "Produit"} 
                      fill 
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="text-gray-400 dark:text-zinc-500 size-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-foreground dark:text-white truncate uppercase tracking-tight w-full pr-2 italic">
                      {item.name || "Article sans nom"}
                    </h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.color)}
                      className="p-1 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {item.availableColors && item.availableColors.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        Couleur : <span className="text-black dark:text-white italic">{item.color || 'Standard'}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableColors.map((c: string) => (
                          <button
                            key={c}
                            onClick={() => updateColor(item.id, item.color, c)}
                            className={cn(
                              "size-5 rounded-full border-2 transition-all",
                              item.color === c 
                                ? 'border-black dark:border-white scale-110 shadow-md ring-2 ring-black/5 dark:ring-white/5' 
                                : 'border-transparent opacity-40 hover:opacity-100'
                            )}
                            style={{ backgroundColor: c.toLowerCase() }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[#6ab344] font-black text-xl mt-3 leading-none italic">
                    {(item.price || 0).toLocaleString('fr-FR')} <span className="text-[10px] not-italic">FCFA</span>
                  </p>

                  <div className="flex items-center gap-3 mt-4 bg-gray-50 dark:bg-zinc-800 w-fit p-1 rounded-xl border border-black/5 dark:border-white/5">
                    <button 
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1, item.color)}
                      className="size-8 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-600 active:scale-90 transition disabled:opacity-30 text-foreground dark:text-white"
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="font-black text-sm px-2 min-w-[20px] text-center dark:text-white">
                      {item.quantity || 1}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1, item.color)}
                      className="size-8 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-600 active:scale-90 transition text-foreground dark:text-white"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé de commande fixe en bas */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mb-1">Total à payer</p>
              <p className="text-4xl font-black text-black dark:text-white tracking-tighter leading-none italic">
                {total.toLocaleString('fr-FR')} <span className="text-sm font-bold text-[#6ab344]">FCFA</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full uppercase italic border border-orange-100 dark:border-orange-500/20 flex items-center gap-1">
                 <Truck className="size-3" /> Cash On Delivery
              </span>
              <span className="text-[9px] font-bold text-muted-foreground dark:text-zinc-500 italic pr-1">Paiement à la livraison</span>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-6 rounded-[2.5rem] font-black text-sm uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:opacity-90"
          >
            Valider la commande
            <ChevronRight className="size-5 text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  );
}