"use client";

import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowLeft, ChevronRight, Plus, Minus, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity, updateColor } = useCart();
  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="size-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="size-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Ton panier est vide</h2>
        <p className="text-muted-foreground mb-8 max-w-[250px]">
          Ajoute des articles pour profiter des meilleurs deals du moment.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase italic text-sm shadow-lg active:scale-95 transition"
        >
          Découvrir les deals
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter">Mon Panier</h1>
          <button 
            onClick={clearCart} 
            className="text-[10px] font-black uppercase bg-red-50 text-red-500 px-3 py-1.5 rounded-lg active:bg-red-100 transition"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">
          {cart.length} {cart.length > 1 ? 'Articles' : 'Article'} au total
        </p>

        <div className="space-y-4">
          {cart.map((item) => (
            <div 
              key={`${item.id}-${item.color || 'no-color'}`} 
              className="group flex flex-col bg-white p-4 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Image du produit */}
                <div className="relative size-24 rounded-[1.5rem] overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ShoppingBag className="text-gray-400 size-6" />
                    </div>
                  )}
                </div>
                
                {/* Infos du produit */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-foreground truncate uppercase tracking-tight w-full">
                      {item.name}
                    </h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.color)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* SÉLECTEUR DE COULEUR */}
                  {item.availableColors && item.availableColors.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Couleur : <span className="text-black">{item.color}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableColors.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateColor(item.id, item.color, c)}
                            className={cn(
                              "size-6 rounded-full border-2 transition-all",
                              item.color === c 
                                ? 'border-black scale-110 shadow-md ring-2 ring-black/5' 
                                : 'border-transparent opacity-40 hover:opacity-100'
                            )}
                            style={{ backgroundColor: c.toLowerCase() }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[#6ab344] font-black text-xl mt-3 leading-none">
                    {item.price.toLocaleString()} <span className="text-[10px]">FCFA</span>
                  </p>

                  {/* Sélecteur de Quantité */}
                  <div className="flex items-center gap-3 mt-3 bg-gray-50 w-fit p-1 rounded-xl border border-black/5">
                    <button 
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1, item.color)}
                      className="size-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 active:scale-90 transition disabled:opacity-30"
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="font-black text-sm px-2 min-w-[20px] text-center">{item.quantity || 1}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1, item.color)}
                      className="size-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-100 active:scale-90 transition"
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
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-black/5 p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total panier</p>
              <p className="text-4xl font-black text-black tracking-tighter leading-none">
                {total.toLocaleString()} <span className="text-sm font-bold">FCFA</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-[#4a90e2] bg-blue-50 px-3 py-1.5 rounded-full uppercase italic border border-blue-100 flex items-center gap-1">
                 <ShieldCheck className="size-3" /> Paiement Sécurisé
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-sm uppercase italic tracking-widest shadow-xl active:scale-95 transition flex items-center justify-center gap-3"
          >
            Finaliser & Payer
            <ChevronRight className="size-5 text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  );
}