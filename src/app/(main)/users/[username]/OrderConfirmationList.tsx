"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ShoppingCart, CheckCircle2, Clock, Truck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import OrderConfirmButton from "./OrderConfirmButton"; 

interface OrderConfirmationListProps {
  userId: string;
}

export default function OrderConfirmationList({ userId }: OrderConfirmationListProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/orders`);
      if (!res.ok) throw new Error("Erreur lors du chargement des commandes");
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-3">
      <Loader2 className="animate-spin size-8 text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Chargement de vos colis...</p>
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 bg-card border-2 border-dashed rounded-[2.5rem] border-muted/20">
        <ShoppingCart className="size-12 mx-auto text-muted-foreground/10 mb-4" />
        <p className="text-muted-foreground font-black uppercase text-[11px] tracking-[0.2em]">
          Aucun achat effectué pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER DE SECTION */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Package className="size-5 text-primary" />
          </div>
          <h2 className="font-black uppercase italic tracking-tighter text-lg">
            Mes Colis <span className="text-primary/50 text-sm ml-1">({orders.length})</span>
          </h2>
        </div>
      </div>
      
      <div className="space-y-4">
        {orders.map((order: any) => {
          const displayPrice = order.price || order.totalAmount || 0;
          
          // --- LOGIQUE DES STATUTS CORRIGÉE POUR DEALCITY ---
          const isPending = order.status === "PENDING";      // Juste commandé
          const isDelivered = order.status === "DELIVERED";  // Encaissé par le livreur
          const isCompleted = order.status === "COMPLETED";  // Clôturé
          
          // Le bouton de confirmation s'affiche quand le livreur a marqué "DELIVERED"
          const canConfirm = isDelivered; 

          return (
            <div 
              key={order.id} 
              className={cn(
                "group relative bg-card border rounded-[2.2rem] overflow-hidden transition-all duration-300",
                canConfirm ? "border-blue-500/30 bg-blue-50/10 shadow-md shadow-blue-500/5" : "border-border shadow-sm",
                isPending && "opacity-90"
              )}
            >
              {/* INDICATEUR LATÉRAL ÉPAIS */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2",
                isPending && "bg-orange-400",
                canConfirm && "bg-blue-500 animate-pulse",
                isCompleted && "bg-[#6ab344]"
              )} />

              <div className="p-5 pl-7">
                <div className="flex gap-5">
                  {/* IMAGE PRODUIT */}
                  <div className="relative size-20 rounded-[1.4rem] overflow-hidden border bg-muted shrink-0 shadow-inner">
                    <Image 
                      src={order.post?.attachments?.[0]?.url || "/placeholder.png"} 
                      fill 
                      alt="Produit" 
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                      unoptimized
                    />
                  </div>

                  {/* CONTENU INFOS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-black uppercase text-[12px] truncate text-foreground/80 tracking-tight">
                          {order.post?.content || "Article DealCity"}
                        </h4>
                        <span className="text-sm font-black text-[#6ab344] italic">
                          {Number(displayPrice).toLocaleString()} <small className="text-[10px] not-italic opacity-70 ml-0.5">F</small>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                         <div className={cn(
                           "p-1 rounded-md",
                           isPending && "bg-orange-100 text-orange-500",
                           canConfirm && "bg-blue-100 text-blue-500",
                           isCompleted && "bg-green-100 text-green-500"
                         )}>
                           {isPending && <Clock className="size-3" />}
                           {canConfirm && <Truck className="size-3" />}
                           {isCompleted && <CheckCircle2 className="size-3" />}
                         </div>
                         
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest italic",
                           isPending && "text-orange-600",
                           canConfirm && "text-blue-600",
                           isCompleted && "text-green-600"
                         )}>
                           {isPending && "Préparation / En route"}
                           {canConfirm && "Colis livré ! À confirmer"}
                           {isCompleted && "Commande terminée"}
                         </span>
                      </div>
                    </div>

                    {/* ACTION DE CONFIRMATION (Uniquement si DELIVERED) */}
                    {canConfirm && (
                      <div className="mt-4 pt-4 border-t border-blue-500/10">
                        <div className="flex flex-col gap-3">
                          <p className="text-[9px] font-black text-blue-500/70 uppercase tracking-tighter">
                            Cliquez ci-dessous pour confirmer que vous avez bien reçu votre colis :
                          </p>
                          <OrderConfirmButton orderId={order.id} status={order.status} />
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-3 pt-3 border-t border-dashed border-green-200/50">
                        <p className="text-[10px] font-black text-[#6ab344] uppercase tracking-widest italic">
                          Merci de votre confiance !
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}