"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, User, XCircle, Palette,
  MoreVertical, Trash2, CheckCircle
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const MY_ADMIN_ID = "22lmc64bcqwsqybu"; 

export default function DeliveryDashboard() {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Correction 1: useCallback pour éviter les boucles et warnings
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders/delivery"); 
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ variant: "destructive", description: "Erreur de chargement des colis." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!loggedInUser) { router.push("/login"); return; }
    if (loggedInUser.id !== MY_ADMIN_ID) { router.push("/"); return; }
    fetchOrders();
  }, [loggedInUser, router, fetchOrders]);

  async function handleAction(orderId: string, action: 'deliver' | 'cancel' | 'delete') {
    const confirmMessages = {
      deliver: "Confirmes-tu avoir encaissé l'argent liquide auprès du client ?",
      cancel: "Voulez-vous marquer cette commande comme ANNULÉE ?",
      delete: "Voulez-vous SUPPRIMER définitivement cette commande ?"
    };

    if (!window.confirm(confirmMessages[action])) return;

    setIsUpdating(orderId);
    try {
      const apiEndpoint = action === 'deliver' ? 'complete' : action;
      const res = await fetch(`/api/orders/${orderId}/${apiEndpoint}`, { method: "POST" });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ description: action === 'deliver' ? "✅ Livraison validée !" : "Opération réussie." });
      } else {
        throw new Error("Échec de l'opération");
      }
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message });
    } finally {
      setIsUpdating(null);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loader2 className="animate-spin size-12 text-blue-600" />
      <p className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">Chargement...</p>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-black/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white"><Truck className="size-6" /></div>
          <div>
            <h1 className="text-xl font-black uppercase italic dark:text-white">Livreur DealCity</h1>
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Mode Cash on Delivery</p>
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl text-xl font-black">{orders.length}</div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-center py-20 opacity-40 font-bold italic uppercase">Aucun colis en attente.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-black/5 rounded-[2.5rem] p-6 space-y-6 shadow-sm relative">
              <div className="absolute top-6 right-6 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-zinc-100 rounded-full"><MoreVertical className="size-6 text-zinc-400" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[200px]">
                    <DropdownMenuItem onClick={() => handleAction(order.id, 'deliver')} className="text-green-600 font-bold"><CheckCircle className="size-4 mr-2" /> Livrer</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction(order.id, 'cancel')} className="text-orange-600 font-bold"><XCircle className="size-4 mr-2" /> Annuler</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction(order.id, 'delete')} className="text-red-600 font-bold"><Trash2 className="size-4 mr-2" /> Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-4">
                <div className="relative size-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                  <Image src={order.productImage} fill alt="Produit" className="object-cover" unoptimized />
                  <div className="absolute top-1 right-1 bg-black text-white text-[10px] font-black px-2 py-1 rounded-lg">x{order.quantity}</div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="font-black text-base uppercase leading-tight">{order.productName}</h2>
                  <div className="flex items-center gap-2 my-2">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Palette className="size-3" /> {order.clientChoice}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#6ab344]">{Number(order.price).toLocaleString()} FCFA</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-black/5 flex items-start gap-3">
                  <MapPin className="size-5 text-blue-600 mt-1" />
                  <p className="text-sm font-bold text-zinc-800">{order.deliveryAddress}</p>
                </div>
                <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-zinc-400" />
                    <p className="text-sm font-black uppercase text-blue-700">{order.customerName}</p>
                  </div>
                  <a href={`tel:${order.customerPhone}`} className="bg-[#6ab344] text-white size-11 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="size-5" />
                  </a>
                </div>
              </div>

              {/* Correction 2: Utilisation de &ldquo; et &rdquo; pour éviter les erreurs de guillemets */}
              {order.clientNote && (
                <div className="bg-zinc-100 p-4 rounded-2xl border-l-4 border-orange-400">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Indications :</p>
                  <p className="text-xs italic text-zinc-600">&ldquo;{order.clientNote}&rdquo;</p>
                </div>
              )}

              <button 
                onClick={() => handleAction(order.id, 'deliver')}
                disabled={isUpdating === order.id}
                className="w-full py-5 bg-black text-white rounded-[1.8rem] font-black uppercase text-[11px] flex items-center justify-center gap-3 shadow-xl"
              >
                {isUpdating === order.id ? <Loader2 className="animate-spin size-5" /> : <PackageCheck className="size-5" />}
                Valider la livraison
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}