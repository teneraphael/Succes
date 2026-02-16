"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase"; // Vérifie ton chemin
import { toast } from "sonner"; // Ou ta librairie de notifications

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

 const handleEnableNotifications = async () => {
    // 1. Sécurité TypeScript : On vérifie si messaging existe
    if (!messaging) {
      toast.error("Le service de messagerie n'est pas initialisé.");
      return;
    }

    setLoading(true);
    try {
      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === "granted") {
        // TypeScript sait désormais que 'messaging' ne peut pas être null ici
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
          await fetch("/api/notifications/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          toast.success("Notifications activées avec succès !");
        }
      } else if (status === "denied") {
        toast.error("Vous avez bloqué les notifications.");
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      {/* Retour aux paramètres */}
      <Link href="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} />
        Retour
      </Link>

      <div className="px-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Notifications</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Gérez vos alertes en temps réel</p>
      </div>

      <div className="bg-muted/30 rounded-[2rem] border border-border p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className={`p-6 rounded-full ${permission === 'granted' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
            {permission === 'granted' ? <Bell size={48} /> : <BellOff size={48} />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            {permission === 'granted' ? "Notifications activées" : "Notifications désactivées"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {permission === 'granted' 
              ? "Vous recevrez une alerte pour chaque nouveau message ou bon plan." 
              : "Activez les notifications pour ne rater aucune vente sur DealCity."}
          </p>
        </div>

        {permission !== 'granted' ? (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="w-full h-[60px] bg-[#4a90e2] text-white rounded-[1.5rem] font-black uppercase italic tracking-widest hover:bg-[#357abd] transition-all disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Activer maintenant"}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-500 text-xs font-black uppercase tracking-widest border border-green-500/20 bg-green-500/5 py-3 rounded-xl italic">
            <ShieldCheck size={16} />
            Service actif sur ce navigateur
          </div>
        )}
      </div>

      {/* Guide en cas de blocage */}
      {permission === 'denied' && (
        <div className="p-6 bg-destructive/5 rounded-[1.5rem] border border-destructive/10 text-center">
          <p className="text-xs font-bold text-destructive uppercase tracking-tight">
            ⚠️ Les notifications sont bloquées par votre navigateur. <br />
            Cliquez sur le cadenas dans la barre d&apos;adresse pour les réautoriser.
          </p>
        </div>
      )}
    </div>
  );
}