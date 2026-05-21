"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ShoppingCart, CheckCircle2, Clock, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import OrderConfirmButton from "./OrderConfirmButton"; 
import { PayDeliveryButton } from "@/app/actions/PayDeliveryButton"; // Ton nouveau bouton

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
          
          // Logique des statuts incluant le paiement des frais
          const isPendingFee = order.status === "PENDING_DELIVERY_FEE"; 
          const isPending = order.status === "PENDING";
          const isDelivered = order.status === "DELIVERED";
          const isCompleted = order.status === "COMPLETED";
          
          const canConfirm = isDelivered; 

          return (
            <div 
              key={order.id} 
              className={cn(
                "group relative bg-card border rounded-[2.2rem] overflow-hidden transition-all duration-300",
                canConfirm ? "border-blue-500/30 bg-blue-50/10" : "border-border",
                isPendingFee && "border-amber-500/30 bg-amber-50/10"
              )}
            >
              {/* INDICATEUR LATÉRAL */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2",
                isPendingFee && "bg-amber-500 animate-pulse",
                isPending && "bg-orange-400",
                canConfirm && "bg-blue-500",
                isCompleted && "bg-[#6ab344]"
              )} />

              <div className="p-5 pl-7">
                <div className="flex gap-5">
                  <div className="relative size-20 rounded-[1.4rem] overflow-hidden border bg-muted shrink-0">
                    <Image 
                      src={order.post?.attachments?.[0]?.url || "/placeholder.png"} 
                      fill alt="Produit" className="object-cover" unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-black uppercase text-[12px] truncate">{order.post?.content || "Article"}</h4>
                        <span className="text-sm font-black text-[#6ab344] italic">
                          {Number(displayPrice).toLocaleString()} <small className="text-[10px] opacity-70">F</small>
                        </span>
                      </div>

                      {/* STATUT */}
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded-md", isPendingFee ? "bg-amber-100 text-amber-600" : "bg-muted")}>
                           {isPendingFee && <CreditCard className="size-3" />}
                        </div>
                        <span className={cn("text-[10px] font-black uppercase italic", isPendingFee ? "text-amber-600" : "text-muted-foreground")}>
                           {isPendingFee ? "En attente des frais de livraison (1000 FCFA)" : "Suivi en cours"}
                        </span>
                      </div>
                    </div>

                    {/* ACTION PAIEMENT FRAIS */}
                    {isPendingFee && (
                      <div className="mt-3">
                        <PayDeliveryButton orderId={order.id} />
                      </div>
                    )}

                    {/* ACTION CONFIRMATION */}
                    {canConfirm && <OrderConfirmButton orderId={order.id} status={order.status} />}
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