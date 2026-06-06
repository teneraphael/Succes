"use client";

import { useState } from "react";
import { CheckCircle2, Store, Zap, Eye, MessageCircle } from "lucide-react";
import { SellerPaymentModal } from "@/components/SellerPaymentModal";

const features = [
  {
    icon: <Store className="size-4 text-[#4a90e2]" />,
    label: "Publication illimitée",
  },
  {
    icon: <Eye className="size-4 text-[#4a90e2]" />,
    label: "Visibilité accrue",
  },
  {
    icon: <MessageCircle className="size-4 text-[#4a90e2]" />,
    label: "Contact WhatsApp direct",
  },
  {
    icon: <Zap className="size-4 text-[#6ab344]" />,
    label: "Accès au Seller Studio",
  },
];

export default function BecomeSellerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0fff4] dark:from-[#0a0f1a] dark:via-[#0a0a0a] dark:to-[#0a0f0a] p-4 sm:p-8 transition-colors duration-300">

      {/* ✅ Cercles décoratifs DealCity */}
      <div className="pointer-events-none absolute -top-32 -right-32 size-[500px] rounded-full bg-[#4a90e2]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-[#6ab344]/5 blur-3xl" />

      <div className="w-full max-w-[420px] flex flex-col items-center gap-8 relative">

        {/* ✅ Logo DealCity animé */}
        <div className="flex items-end gap-2">
          <div className="flex items-end gap-[5px]">
            <div className="w-[8px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
            <div className="w-[8px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
            <div className="w-[8px] h-12 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
            <div className="w-[8px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
          </div>
          <span className="text-4xl font-black text-[#6ab344] tracking-tight leading-none pb-1">
            DealCity
          </span>
        </div>

        {/* ✅ Titre */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Store className="size-5 text-[#4a90e2]" />
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-[#4a90e2]">
              Devenir Vendeur
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Passez au niveau supérieur avec DealCity PRO
          </p>
        </div>

        {/* ✅ Carte principale */}
        <div className="w-full bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#4a90e2]/8 border border-[#4a90e2]/10 dark:border-white/5 overflow-hidden">

          {/* Prix — bandeau vert */}
          <div className="bg-gradient-to-r from-[#4a90e2] to-[#6ab344] p-6 text-center">
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">
              Accès complet
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-white font-mono">
                5 000
              </span>
              <span className="text-lg font-bold text-white/80">XAF</span>
            </div>
            <p className="text-white/60 text-[10px] font-bold mt-1 uppercase tracking-widest">
              Paiement unique
            </p>
          </div>

          {/* ✅ Liste des avantages */}
          <div className="p-6 space-y-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/8"
              >
                <div className="size-8 rounded-xl bg-white dark:bg-zinc-900 border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
                  {feature.icon}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {feature.label}
                </span>
                <CheckCircle2 className="size-4 text-[#6ab344] ml-auto shrink-0" />
              </div>
            ))}
          </div>

          {/* ✅ Bouton paiement */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full h-14 rounded-2xl bg-[#6ab344] hover:bg-[#5a9a38] text-white font-black uppercase italic tracking-tight text-sm shadow-lg shadow-[#6ab344]/25 transition-all hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <Store className="size-4" />
              Payer maintenant
            </button>
          </div>
        </div>

        {/* ✅ Badge sécurité */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
          <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Paiement 100% sécurisé
          </span>
        </div>
      </div>

      {/* ✅ Modal paiement */}
      <SellerPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}