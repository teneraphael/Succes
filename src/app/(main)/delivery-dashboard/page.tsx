"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, User 
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, router]);

  async function fetchOrders() {
    try {
      setLoading(true);
      // Assure-toi que cette route retourne bien les commandes avec le statut "PENDING"
      const res = await fetch("/api/orders/delivery"); 
      if (!res.ok) throw new Error("Erreur lors du chargement des commandes");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        description: error.message || "Impossible de charger les livraisons." 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsDelivered(orderId: string) {
    if (!confirm("Confirmes-tu que ce colis a été remis ? Cela informera le client.")) return;

    setIsUpdating(orderId);
    try {
      // On utilise POST car c'est ce que nous avons défini dans la route API
      const res = await fetch(`/api/orders/${orderId}/complete`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();

      if (res.ok) {
        // On retire la commande de la liste locale (puisqu'elle n'est plus PENDING)
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ 
          description: "✅ Colis validé ! Le client peut maintenant confirmer la réception.",
          className: "bg-green-600 text-white border-none shadow-lg"
        });
      } else {
        // On affiche l'erreur précise retournée par l'API (ex: "Accès refusé")
        throw new Error(result.error || "Erreur lors de la validation");
      }
    } catch (error: any) {
      console.error("DEBUG_DELIVERY_ERROR:", error);
      toast({ 
        variant: "destructive", 
        title: "Échec de validation",
        description: error.message || "Vérifiez votre connexion ou vos droits admin." 
      });
    } finally {
      setIsUpdating(null);
    }
  }

  // Sécurité supplémentaire pendant le rendu
  if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="animate-spin size-12 text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Chargement des colis...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20 space-y-8">
      {/* HEADER STATS */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Truck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Livreur Pro</h1>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Dashboard Officiel</p>
          </div>
        </div>
        <div className="bg-zinc-100 px-4 py-2 rounded-2xl text-center">
          <span className="text-xl font-black block leading-none">{orders.length}</span>
          <span className="text-[8px] font-bold uppercase text-muted-foreground">En attente</span>
        </div>
      </div>

      {/* LISTE DES LIVRAISONS */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200 py-20 flex flex-col items-center gap-4 text-center px-6">
          <div className="bg-zinc-50 p-6 rounded-full">
            <PackageCheck className="size-12 text-zinc-300" />
          </div>
          <p className="font-bold text-zinc-400 uppercase text-xs tracking-widest">
            Aucun colis à livrer pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-black/5 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-shadow space-y-6">
              
              {/* INFOS PRODUIT */}
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
                  <span className="text-[8px] font-black text-blue-600 uppercase mb-1">Désignation</span>
                  <h2 className="font-black text-sm uppercase truncate mb-1">
                    {order.productName || "Article DealCity"}
                  </h2>
                  <div className="text-xl font-black text-[#6ab344] italic">
                    {Number(order.price || 0).toLocaleString()} <span className="text-[10px] not-italic">FCFA</span>
                  </div>
                </div>
              </div>

              {/* COORDONNÉES LIVRAISON */}
              <div className="grid gap-3">
                <div className="flex items-start gap-4 bg-zinc-50 p-4 rounded-2xl border border-black/5">
                  <MapPin className="size-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Point de remise</p>
                    <p className="text-sm font-bold leading-tight text-zinc-800">{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-4">
                    <User className="size-5 text-zinc-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Destinataire</p>
                      <p className="text-sm font-black italic uppercase text-blue-700">
                        {order.customerName}
                      </p>
                    </div>
                  </div>
                  {/* BOUTON APPEL DIRECT */}
                  <a 
                    href={`tel:${order.phoneNumber}`} 
                    className="bg-[#6ab344] text-white size-11 rounded-full flex items-center justify-center shadow-lg hover:bg-[#5aa139] active:scale-90 transition-all"
                  >
                    <Phone className="size-5 fill-current" />
                  </a>
                </div>
              </div>

              {/* ACTION FINALE */}
              <button 
                onClick={() => handleMarkAsDelivered(order.id)}
                disabled={isUpdating === order.id}
                className="w-full py-5 bg-black text-white rounded-[1.8rem] font-black uppercase text-[11px] italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:bg-zinc-800"
              >
                {isUpdating === order.id ? (
                  <>
                    <Loader2 className="animate-spin size-5" />
                    Mise à jour...
                  </>
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