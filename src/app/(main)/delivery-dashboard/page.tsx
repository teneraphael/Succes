"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, User, Banknote, XCircle 
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

const MY_ADMIN_ID = "22lmc64bcqwsqybu"; 

export default function DeliveryDashboard() {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedInUser) { router.push("/login"); return; }
    if (loggedInUser.id !== MY_ADMIN_ID) { router.push("/"); return; }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, router]);

  async function fetchOrders() {
    try {
      setLoading(true);
      // Correction de l'URL vers ton API de récupération des commandes PENDING
      const res = await fetch("/api/orders/delivery"); 
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ variant: "destructive", description: "Erreur de chargement des colis." });
    } finally {
      setLoading(false);
    }
  }

  // VALIDATION DE LIVRAISON (ENCAISSEMENT CASH)
  async function handleConfirmDelivery(orderId: string) {
    if (!confirm("Confirmes-tu avoir encaissé l'argent liquide auprès du client ?")) return;

    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/deliver`, { 
        method: "POST" 
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ description: "✅ Livraison validée et encaissée !" });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la validation");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        description: error.message || "Échec de validation." 
      });
    } finally {
      setIsUpdating(null);
    }
  }

  // ANNULATION DE COMMANDE (SI CLIENT ABSENT OU REFUS)
  async function handleCancelOrder(orderId: string) {
    if (!confirm("Voulez-vous vraiment annuler cette commande ? (Client absent ou refus)")) return;

    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { 
        method: "POST" 
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ description: "Commande annulée et retirée de la liste." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", description: "Erreur lors de l'annulation." });
    } finally {
      setIsUpdating(null);
    }
  }

  if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) return null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loader2 className="animate-spin size-12 text-blue-600" />
      <p className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">Recherche des colis en cours...</p>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-black/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-none">
            <Truck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none dark:text-white">Livreur DealCity</h1>
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">Mode Cash on Delivery</p>
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl">
          <span className="text-xl font-black block leading-none dark:text-white">{orders.length}</span>
        </div>
      </div>

      {/* LISTE DES COLIS */}
      <div className="space-y-6">
        {orders.length === 0 ? (
            <div className="text-center py-20 opacity-40">
                <p className="text-sm font-bold italic uppercase tracking-widest">Aucun colis à livrer pour le moment.</p>
            </div>
        ) : (
            orders.map((order: any) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-black/5 rounded-[2.5rem] p-6 space-y-6 shadow-sm">
                
                {/* PRODUIT & PRIX */}
                <div className="flex gap-4">
                    <div className="relative size-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-black/5">
                        <Image src={order.productImage || "/placeholder.png"} fill alt="Produit" className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <p className="text-[9px] font-black text-blue-600 uppercase italic mb-1 tracking-tighter">Choix du client :</p>
                        <h2 className="font-black text-sm uppercase italic dark:text-white leading-tight mb-2">
                            {order.clientChoice}
                        </h2>
                        <div className="text-2xl font-black text-green-600 italic">
                            {Number(order.price || 0).toLocaleString()} <span className="text-xs not-italic">FCFA</span>
                        </div>
                    </div>
                </div>

                {/* ADRESSE & TEL */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-black/5">
                        <div className="flex items-start gap-3">
                            <MapPin className="size-5 text-blue-600 mt-1" />
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                                {order.deliveryAddress || "Adresse non fournie"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-black/5">
                        <div className="flex items-center gap-3">
                            <User className="size-5 text-zinc-400" />
                            <p className="text-sm font-black italic uppercase text-blue-700 dark:text-blue-400">{order.customerName}</p>
                        </div>
                        <a href={`tel:${order.customerPhone}`} className="bg-[#6ab344] text-white size-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                            <Phone className="size-5 fill-current" />
                        </a>
                    </div>
                </div>

                {/* CONSIGNE DE PAIEMENT */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <Banknote className="size-6 text-blue-600" />
                    <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                        Encaisser impérativement <span className="underline font-black text-sm">{Number(order.price).toLocaleString()} FCFA</span> en espèces avant de remettre le colis.
                    </p>
                </div>

                {/* ACTIONS BOUTONS */}
                <div className="space-y-3">
                    <button 
                        onClick={() => handleConfirmDelivery(order.id)}
                        disabled={isUpdating === order.id}
                        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.8rem] font-black uppercase text-[11px] italic flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isUpdating === order.id ? <Loader2 className="animate-spin size-5" /> : <PackageCheck className="size-5 text-green-500" />}
                        Valider l&apos;encaissement et la remise
                    </button>

                    <button 
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={isUpdating === order.id}
                        className="w-full py-3 text-red-500 font-black uppercase text-[9px] italic border border-red-100 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <XCircle className="size-4" />
                        Annuler / Client Absent
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </main>
  );
}