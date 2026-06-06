"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!messaging) {
      toast.error("Le service de messagerie n'est pas initialisé.");
      return;
    }

    setLoading(true);
    try {
      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === "granted") {
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

      {/* Retour */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#4a90e2] transition-colors group"
      >
        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-[#4a90e2]/10 border border-border group-hover:border-[#4a90e2]/20 transition-all">
          <ArrowLeft size={14} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          Retour aux paramètres
        </span>
      </Link>

      {/* Titre */}
      <div className="flex items-center gap-3 px-1">
        <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
          <Bell className="size-4 text-[#4a90e2]" />
        </div>
        <div>
          <h1 className="text-base font-black uppercase tracking-tight text-foreground leading-none">
            Notifications
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Gérez vos alertes en temps réel
          </p>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">

        {/* Icône statut */}
        <div className={`flex flex-col items-center gap-4 p-8 border-b border-border/40 ${
          permission === "granted"
            ? "bg-[#6ab344]/5"
            : "bg-[#4a90e2]/5"
        }`}>
          <div className={`size-20 rounded-2xl flex items-center justify-center border-2 ${
            permission === "granted"
              ? "bg-[#6ab344]/10 border-[#6ab344]/20 text-[#6ab344]"
              : "bg-[#4a90e2]/10 border-[#4a90e2]/20 text-[#4a90e2]"
          }`}>
            {permission === "granted"
              ? <Bell className="size-9" />
              : <BellOff className="size-9" />
            }
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="font-black text-foreground uppercase tracking-tight">
              {permission === "granted"
                ? "Notifications activées"
                : "Notifications désactivées"
              }
            </h2>
            <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
              {permission === "granted"
                ? "Vous recevrez une alerte pour chaque nouveau message ou bon plan."
                : "Activez les notifications pour ne rater aucune vente sur DealCity."
              }
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="p-6">
          {permission !== "granted" ? (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="w-full h-14 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-2xl font-black uppercase italic tracking-tight text-sm shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Activation...
                </span>
              ) : (
                "Activer maintenant"
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#6ab344]/8 border border-[#6ab344]/20">
              <ShieldCheck className="size-4 text-[#6ab344]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#6ab344]">
                Service actif sur ce navigateur
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alerte blocage */}
      {permission === "denied" && (
        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/30">
          <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">
            Les notifications sont bloquées par votre navigateur. Cliquez sur le cadenas dans la barre d&apos;adresse pour les réautoriser.
          </p>
        </div>
      )}

      {/* Badge DealCity */}
      <div className="flex items-center justify-center gap-3 py-2 opacity-40">
        <div className="h-px w-10 bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-[3px]">
            <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-3.5 bg-[#4a90e2] rounded-sm" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            DealCity
          </span>
        </div>
        <div className="h-px w-10 bg-border" />
      </div>

    </div>
  );
}