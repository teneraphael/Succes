"use client";

import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, ChevronRight, Plus, Minus, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const total = cart?.reduce((acc, item) => {
    const price = item.price || 0;
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0) || 0;

  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-background transition-colors">
        <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6 border border-border">
          <ShoppingBag className="size-9 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2 italic">Votre panier est vide</h2>
        <p className="text-muted-foreground mb-8 max-w-[260px] text-xs leading-relaxed">
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

  const handleCheckoutRedirect = () => {
    const encodedData = Buffer.from(JSON.stringify(cart)).toString('base64');
    router.push(`/pre-payment?p_data=${encodedData}`);
  };

  return (
    <div className="min-h-screen bg-background pb-40 transition-colors font-sans text-foreground">
      
      <div className="bg-card border-b border-border sticky top-0 z-10 px-4 py-5 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 hover:bg-muted rounded-full transition"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tight italic">Mon Panier</h1>
          <button 
            onClick={() => {
              if (confirm("Vider tout le panier ?")) clearCart();
            }} 
            className="text-[10px] font-extrabold uppercase bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl transition-all border border-red-500/10"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 italic">
          {cart.length} {cart.length > 1 ? 'Articles ajoutés' : 'Article ajouté'}
        </p>

        <div className="space-y-4">
          {cart.map((item, index) => {
            const itemKey = item.variantId ? `variant-${item.variantId}` : `product-${item.id}-${item.color || index}`;
            
            return (
              <div 
                key={itemKey} 
                className="group flex flex-col bg-card p-4 rounded-[26px] border border-border shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative size-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
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
                        <ShoppingBag className="text-muted-foreground size-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[96px]">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-sm uppercase tracking-tight italic line-clamp-2">
                          {item.name || "Article sans nom"}
                        </h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id, item.variantId, item.color);
                          }}
                          className="p-1 -mr-1 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-1">
                        {item.selectedOptions ? (
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block tracking-wider">
                            {item.selectedOptions}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Option : <span className="text-foreground italic font-black">{item.color || 'Standard'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3 gap-2">
                      <p className="text-[#00b272] font-black text-lg tracking-tight leading-none italic">
                        {(item.price || 0).toLocaleString('fr-FR')} <span className="text-[10px] not-italic font-bold">FCFA</span>
                      </p>

                      <div className="flex items-center gap-2.5 bg-background p-1 rounded-xl border border-border">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, (item.quantity || 1) - 1, item.variantId, item.color);
                          }}
                          className="size-7 flex items-center justify-center bg-card rounded-lg shadow-sm hover:bg-muted active:scale-90 transition disabled:opacity-30"
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-black text-xs min-w-[16px] text-center">
                          {item.quantity || 1}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Correction : Conversion explicite en nombre pour éviter l'erreur de type
                            const stockLimit = Number(item.stock || 0);
                            const currentQty = item.quantity || 1;

                            if (stockLimit > 0 && currentQty >= stockLimit) {
                              toast({ 
                                variant: "destructive", 
                                title: "STOCK LIMITÉ", 
                                description: "Quantité maximale atteinte." 
                              });
                            } else {
                              updateQuantity(item.id, currentQty + 1, item.variantId, item.color);
                            }
                          }}
                          className="size-7 flex items-center justify-center bg-card rounded-lg shadow-sm hover:bg-muted active:scale-90 transition"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-xl border-t border-border p-5 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] z-50 transition-colors">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-end px-1">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Total à payer</p>
              <p className="text-3xl font-black tracking-tighter leading-none italic">
                {total.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#00b272]">FCFA</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-extrabold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg uppercase italic border border-orange-500/10 flex items-center gap-1">
                <Truck className="size-3" /> Cash On Delivery
              </span>
              <span className="text-[8px] font-medium text-muted-foreground italic">Paiement direct à la livraison</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckoutRedirect}
            className="w-full bg-[#00b272] hover:bg-[#009a62] text-white py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Valider la commande</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}