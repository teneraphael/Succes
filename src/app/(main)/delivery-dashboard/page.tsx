"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Truck, MapPin, Phone, PackageCheck, 
  Loader2, User, MessageSquare, ExternalLink, ShieldCheck 
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

  // ÉTAT AJOUTÉ : Pour gérer la saisie du code OTP par commande
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});

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

  // FONCTION MODIFIÉE : Utilise maintenant l'API verify-otp
  async function handleMarkAsDelivered(orderId: string) {
    const code = otpInputs[orderId];

    if (!code || code.length !== 4) {
      toast({ 
        variant: "destructive", 
        description: "Veuillez saisir le code de vérification à 4 chiffres reçu par le client." 
      });
      return;
    }

    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/verify-otp`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otpCode: code })
      });

      const result = await res.json();

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast({ 
          description: "✅ Code valide ! Livraison confirmée et vendeur crédité.",
          className: "bg-green-600 text-white border-none shadow-lg"
        });
      } else {
        throw new Error(result.error || "Code incorrect");
      }
    } catch (error: any) {
      console.error("DEBUG_DELIVERY_ERROR:", error);
      toast({ 
        variant: "destructive", 
        title: "Échec de validation",
        description: error.message || "Vérifiez le code ou vos droits admin." 
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
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-500 animate-pulse">
          Chargement des colis...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20 space-y-8 transition-colors">
      {/* HEADER STATS */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Truck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none dark:text-white italic">Livreur Pro</h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-1">Dashboard Officiel</p>
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl text-center">
          <span className="text-xl font-black block leading-none dark:text-white">{orders.length}</span>
          <span className="text-[8px] font-bold uppercase text-muted-foreground dark:text-zinc-500">En attente</span>
        </div>
      </div>

      {/* LISTE DES LIVRAISONS */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 py-20 flex flex-col items-center gap-4 text-center px-6 transition-colors">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-full">
            <PackageCheck className="size-12 text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="font-bold text-zinc-400 dark:text-zinc-500 uppercase text-xs tracking-widest italic">
            Aucun colis à livrer pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all space-y-6">
              
              {/* INFOS PRODUIT */}
              <div className="flex gap-4">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-black/5 dark:border-white/5">
                  <Image 
                    src={order.productImage || "/placeholder.png"} 
                    fill 
                    alt="Produit" 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-widest">Désignation</span>
                  <h2 className="font-black text-sm uppercase truncate mb-1 dark:text-white italic">
                    {order.productName || "Article DealCity"}
                  </h2>
                  <div className="text-xl font-black text-[#6ab344] italic leading-none">
                    {Number(order.price || 0).toLocaleString('fr-FR')} <span className="text-[10px] not-italic">FCFA</span>
                  </div>
                </div>
              </div>

              {/* SECTION NOTES / PERSONNALISATION */}
              {order.notes && (
                <div className="bg-orange-50 dark:bg-orange-500/5 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/10 flex items-start gap-3">
                  <MessageSquare className="size-4 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-orange-600/70 dark:text-orange-400/70 tracking-tighter">Préférences client :</p>
                    <p className="text-xs font-bold text-orange-700 dark:text-orange-500 italic">
                      &quot;{order.notes}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* COORDONNÉES LIVRAISON */}
              <div className="grid gap-3">
                <div className="flex items-start justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                  <div className="flex items-start gap-4">
                    <MapPin className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">Point de remise</p>
                      <p className="text-sm font-bold leading-tight text-zinc-800 dark:text-zinc-200">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  
                  {/* BOUTON ITINÉRAIRE GOOGLE MAPS */}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-zinc-700 p-2 rounded-xl shadow-sm border border-black/5 dark:border-white/10 active:scale-90 transition-all flex flex-col items-center gap-1 min-w-[55px] flex-shrink-0"
                  >
                    <div className="size-6 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                      <ExternalLink className="size-3 text-red-600" />
                    </div>
                    <span className="text-[8px] font-black uppercase dark:text-white">Aller</span>
                  </a>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <User className="size-5 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">Destinataire</p>
                      <p className="text-sm font-black italic uppercase text-blue-700 dark:text-blue-400">
                        {order.customerName}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${order.customerPhone || order.phoneNumber}`} 
                    className="bg-[#6ab344] text-white size-11 rounded-full flex items-center justify-center shadow-lg hover:bg-[#5aa139] active:scale-90 transition-all"
                  >
                    <Phone className="size-5 fill-current" />
                  </a>
                </div>
              </div>

              {/* --- NOUVELLE ZONE DE SÉCURITÉ OTP --- */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest italic">Vérification de sécurité</span>
                </div>
                
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="CODE SMS DU CLIENT"
                  value={otpInputs[order.id] || ""}
                  onChange={(e) => setOtpInputs({...otpInputs, [order.id]: e.target.value.replace(/\D/g, '')})}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-950 text-center text-2xl font-black tracking-[0.8rem] focus:border-blue-600 outline-none transition-all dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 placeholder:tracking-normal placeholder:text-xs"
                />
              </div>

              {/* ACTION FINALE */}
              <button 
                onClick={() => handleMarkAsDelivered(order.id)}
                disabled={isUpdating === order.id}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.8rem] font-black uppercase text-[11px] italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:bg-zinc-800 dark:disabled:bg-zinc-700"
              >
                {isUpdating === order.id ? (
                  <>
                    <Loader2 className="animate-spin size-5" />
                    Vérification...
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