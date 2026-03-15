"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, AlertTriangle, User 
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

const MY_ADMIN_ID = "4yq76ntw6lpduptd"; 

export default function DeliveryDashboard() {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedInUser) {
      router.push("/login");
      return;
    }

    if (loggedInUser.id !== MY_ADMIN_ID) {
      toast({ variant: "destructive", description: "Accès non autorisé." });
      router.push("/");
      return;
    }

    fetchOrders();
  }, [loggedInUser, router]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/orders/delivery");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ variant: "destructive", description: "Impossible de charger les livraisons." });
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsDelivered(orderId: string) {
    if (!confirm("Confirmes-tu que ce colis a bien été remis au client ?")) return;

    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { 
        method: "POST" 
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ 
          description: "✅ Statut mis à jour : Colis livré !",
          className: "bg-green-600 text-white border-none"
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        description: "Erreur lors de la validation." 
      });
    } finally {
      setIsUpdating(null);
    }
  }

  if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="animate-spin size-12 text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mise à jour...</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Truck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Livreur Pro</h1>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Dashboard</p>
          </div>
        </div>
        <div className="bg-zinc-100 px-4 py-2 rounded-2xl text-center">
          <span className="text-xl font-black block leading-none">{orders.length}</span>
          <span className="text-[8px] font-bold uppercase text-muted-foreground">Colis</span>
        </div>
      </div>

      {/* LISTE DES COMMANDES */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200 py-20 flex flex-col items-center gap-4 text-center px-6">
          <PackageCheck className="size-12 text-zinc-300" />
          <p className="font-bold text-zinc-400 uppercase text-xs tracking-widest">Aucune livraison en cours</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-black/5 rounded-[2.5rem] p-6 shadow-sm space-y-6">
              
              {/* PRODUIT (Utilisation des données aplaties) */}
              <div className="flex gap-4">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-black/5">
                  <Image 
                    src={order.productImage || "/placeholder.png"} 
                    fill 
                    alt="Produit" 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h2 className="font-black text-sm uppercase truncate mb-1">
                    {order.productName}
                  </h2>
                  <div className="text-xl font-black text-[#6ab344] italic">
                    {Number(order.price).toLocaleString()} <span className="text-[10px]">FCFA</span>
                  </div>
                </div>
              </div>

              {/* CLIENT & ADRESSE */}
              <div className="space-y-3">
                <div className="flex items-start gap-4 bg-zinc-50 p-4 rounded-2xl border border-black/5">
                  <MapPin className="size-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Destination</p>
                    <p className="text-sm font-bold leading-tight text-zinc-800">{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-4">
                    <User className="size-5 text-zinc-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Client</p>
                      <p className="text-sm font-black italic uppercase text-blue-700">
                        {order.customerName}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${order.phoneNumber}`} 
                    className="bg-[#6ab344] text-white size-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
                  >
                    <Phone className="size-4 fill-current" />
                  </a>
                </div>
              </div>

              {/* BOUTON D'ACTION */}
              <button 
                onClick={() => handleMarkAsDelivered(order.id)}
                disabled={isUpdating === order.id}
                className="w-full py-5 bg-black text-white rounded-[1.8rem] font-black uppercase text-[11px] italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition disabled:opacity-50"
              >
                {isUpdating === order.id ? (
                  <Loader2 className="animate-spin size-5" />
                ) : (
                  <>
                    <PackageCheck className="size-5 text-[#6ab344]" />
                    Confirmer la remise du colis
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}