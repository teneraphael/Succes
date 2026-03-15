"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ShoppingCart, CheckCircle2, Clock, Truck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import OrderConfirmButton from "./OrderConfirmButton"; 

export default function OrderConfirmationList({ userId }: { userId: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/orders`);
      if (!res.ok) throw new Error("Erreur lors du chargement");
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="flex justify-center p-10">
      <Loader2 className="animate-spin size-6 text-primary" />
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-10 bg-card border-2 border-dashed rounded-3xl">
        <ShoppingCart className="size-10 mx-auto text-muted-foreground/20 mb-2" />
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
          Aucun achat effectué
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Package className="size-4 text-primary" />
        <h2 className="font-black uppercase italic tracking-tighter text-md">
          Mes Colis ({orders.length})
        </h2>
      </div>
      
      <div className="space-y-3">
        {orders.map((order: any) => {
          // Sécurité sur le prix
          const displayPrice = order.price || order.totalAmount || 0;
          
          // Conditions de statut
          const isPending = order.status === "PENDING";
          const isCompleted = order.status === "COMPLETED";
          // Le bouton apparaît si ce n'est ni en attente, ni déjà terminé
          const canConfirm = !isPending && !isCompleted;

          return (
            <div 
              key={order.id} 
              className={cn(
                "group relative bg-card border rounded-[2rem] overflow-hidden transition-all hover:shadow-sm",
                canConfirm ? "border-blue-500 bg-blue-50/20" : "border-border"
              )}
            >
              {/* INDICATEUR LATÉRAL DE COULEUR */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                isPending && "bg-zinc-300",
                canConfirm && "bg-blue-500 animate-pulse",
                isCompleted && "bg-green-500"
              )} />

              <div className="p-4 pl-6">
                <div className="flex gap-4">
                  {/* IMAGE PRODUIT */}
                  <div className="relative size-16 rounded-2xl overflow-hidden border bg-muted flex-shrink-0">
                    <Image 
                      src={order.post?.attachments?.[0]?.url || "/placeholder.png"} 
                      fill 
                      alt="Produit" 
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* INFOS PRODUIT */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold uppercase text-[11px] truncate text-zinc-600">
                        {order.post?.content || "Article DealCity"}
                      </h4>
                      <span className="text-xs font-black text-[#6ab344] whitespace-nowrap">
                        {Number(displayPrice).toLocaleString()} F
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                       {isPending && <Clock className="size-3 text-zinc-400" />}
                       {canConfirm && <Truck className="size-3 text-blue-500" />}
                       {isCompleted && <CheckCircle2 className="size-3 text-green-500" />}
                       
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-tight",
                         isPending && "text-zinc-400",
                         canConfirm && "text-blue-600",
                         isCompleted && "text-green-600"
                       )}>
                         {isPending && "En préparation"}
                         {canConfirm && "Colis expédié / À confirmer"}
                         {isCompleted && "Commande reçue"}
                       </span>
                    </div>

                    {/* SECTION BOUTON DE CONFIRMATION */}
                    {canConfirm && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <div className="flex flex-col gap-2">
                          <p className="text-[9px] font-bold text-blue-500 italic">
                            Clique ici pour confirmer que tu as reçu ton colis :
                          </p>
                          <OrderConfirmButton orderId={order.id} status={order.status} />
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-2 pt-2 border-t border-dashed border-green-200">
                        <p className="text-[9px] font-black text-green-600 uppercase">
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