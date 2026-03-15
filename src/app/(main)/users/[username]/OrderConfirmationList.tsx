"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ShoppingCart } from "lucide-react";
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
      <Loader2 className="animate-spin size-8 text-primary" />
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 bg-card border-2 border-dashed rounded-[2rem]">
        <ShoppingCart className="size-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
          Aucun achat effectué pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Package className="size-5 text-primary" />
        <h3 className="font-black uppercase italic tracking-tighter text-lg">
          Suivi de mes colis
        </h3>
      </div>
      
      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-card border-2 border-border rounded-[2rem] p-5 shadow-sm space-y-4 transition-all hover:border-primary/20">
            <div className="flex gap-4">
              <div className="relative size-20 rounded-2xl overflow-hidden border bg-muted flex-shrink-0">
                <Image 
                  src={order.post.attachments.find((a: any) => a.type === "IMAGE")?.url || "/placeholder.png"} 
                  fill 
                  alt="Produit" 
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black uppercase italic text-sm truncate">{order.post.productName}</h4>
                <p className="text-lg font-black text-[#6ab344] font-mono leading-none">
                  {order.price.toLocaleString()} <span className="text-[10px]">FCFA</span>
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-3 py-1 rounded-full border",
                    order.status === "SHIPPED" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-200 animate-pulse" 
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  )}>
                    {order.status === "SHIPPED" ? "📦 Colis en route / Arrivé" : "⏳ En préparation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Le bouton n'apparaît que si le statut est SHIPPED (marqué par le livreur) */}
            {order.status === "SHIPPED" && (
              <div className="pt-2">
                <OrderConfirmButton orderId={order.id} status={order.status} />
              </div>
            )}
            
            {order.status === "COMPLETED" && (
              <div className="flex items-center justify-center gap-2 py-2 bg-green-500/5 border border-green-500/20 rounded-xl">
                <span className="text-[10px] font-black uppercase text-green-600">Reçu & Terminé</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}