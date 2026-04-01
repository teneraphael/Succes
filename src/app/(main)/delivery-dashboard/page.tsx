"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, User, Banknote, XCircle, Palette,
  MoreVertical, Trash2, Edit3, CheckCircle
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

  useEffect(() => {
    if (!loggedInUser) { router.push("/login"); return; }
    if (loggedInUser.id !== MY_ADMIN_ID) { router.push("/"); return; }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, router]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/orders/delivery"); 
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({ variant: "destructive", description: "Erreur de chargement des colis." });
    } finally {
      setLoading(false);
    }
  }

  // Fonction générique pour gérer les actions (Livraison / Suppression)
  async function handleAction(orderId: string, action: 'deliver' | 'cancel') {
    const isDelete = action === 'cancel';
    const confirmMsg = isDelete 
      ? "Voulez-vous vraiment SUPPRIMER définitivement cette commande ?" 
      : "Confirmes-tu avoir encaissé l'argent liquide auprès du client ?";

    if (!confirm(confirmMsg)) return;

    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, { 
        method: "POST" 
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ description: isDelete ? "Commande supprimée." : "✅ Livraison validée !" });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'opération");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        description: error.message || "Échec de l'opération." 
      });
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
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
            <Truck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none dark:text-white text-black">Livreur DealCity</h1>
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">Mode Cash on Delivery</p>
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl">
          <span className="text-xl font-black block leading-none dark:text-white text-black">{orders.length}</span>
        </div>
      </div>

      {/* LISTE DES COLIS */}
      <div className="space-y-6">
        {orders.length === 0 ? (
            <div className="text-center py-20 opacity-40">
                <p className="text-sm font-bold italic uppercase tracking-widest text-black dark:text-white">Aucun colis à livrer pour le moment.</p>
            </div>
        ) : (
            orders.map((order: any) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-black/5 rounded-[2.5rem] p-6 space-y-6 shadow-sm relative">
                
                {/* BOUTON OPTIONS (TROIS POINTS) */}
                <div className="absolute top-6 right-6 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full outline-none transition">
                      <MoreVertical className="size-6 text-zinc-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px] shadow-2xl border-black/5 dark:bg-zinc-900">
                      <DropdownMenuItem 
                        onClick={() => handleAction(order.id, 'deliver')}
                        className="flex items-center gap-3 p-3 font-bold text-xs uppercase cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20 rounded-xl"
                      >
                        <CheckCircle className="size-4" /> Livrer le colis
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => router.push(`/orders/edit/${order.id}`)}
                        className="flex items-center gap-3 p-3 font-bold text-xs uppercase cursor-pointer rounded-xl dark:text-white"
                      >
                        <Edit3 className="size-4" /> Modifier l&apos;ordre
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />

                      <DropdownMenuItem 
                        onClick={() => handleAction(order.id, 'cancel')}
                        className="flex items-center gap-3 p-3 font-bold text-xs uppercase cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-xl"
                      >
                        <Trash2 className="size-4" /> Supprimer la commande
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* PRODUIT & PRIX */}
                <div className="flex gap-4">
                    <div className="relative size-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-black/5">
                        <Image 
                            src={order.productImage || "/placeholder.png"} 
                            fill 
                            alt="Produit" 
                            className="object-cover" 
                            unoptimized 
                        />
                        <div className="absolute top-1 right-1 bg-black text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg z-10">
                            x{order.quantity || 1}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center pr-8">
                        <h2 className="font-black text-base uppercase dark:text-white text-black leading-tight mb-1">
                            {order.productName}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-[9px] font-black text-blue-600 uppercase italic tracking-tighter">Choix :</p>
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                              <Palette className="size-3" />
                              {order.clientChoice || "Standard"}
                          </span>
                        </div>

                        <div className="text-2xl font-black text-[#6ab344] italic">
                            {Number(order.price || 0).toLocaleString()} <span className="text-xs not-italic">FCFA</span>
                        </div>
                    </div>
                </div>

                {/* ADRESSE & CONTACT */}
                <div className="space-y-3">
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-black/5">
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

                {/* INDICATIONS / NOTES CLIENT */}
                {order.clientNote && (
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl border-l-4 border-orange-400 shadow-inner">
                        <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Indications client :</p>
                        <p className="text-xs font-medium italic text-zinc-600 dark:text-zinc-400 leading-snug">
                            &quot;{order.clientNote}&quot;
                        </p>
                    </div>
                )}

                {/* CONSIGNES DE PAIEMENT */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <Banknote className="size-6 text-blue-600" />
                    <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                        Encaisser impérativement <span className="underline font-black text-sm">{Number(order.price).toLocaleString()} FCFA</span> en espèces avant de remettre le colis.
                    </p>
                </div>

                {/* BOUTON DE VALIDATION PRINCIPAL */}
                <button 
                    onClick={() => handleAction(order.id, 'deliver')}
                    disabled={isUpdating === order.id}
                    className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.8rem] font-black uppercase text-[11px] italic flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
                >
                    {isUpdating === order.id ? <Loader2 className="animate-spin size-5" /> : <PackageCheck className="size-5 text-green-500" />}
                    Valider la livraison
                </button>
            </div>
            ))
        )}
      </div>
    </main>
  );
}