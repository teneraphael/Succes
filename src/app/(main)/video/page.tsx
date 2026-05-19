import { Metadata } from "next";
import VideoFeed from "./VideoFeed";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Vidéos - DealCity",
  description: "Découvrez les meilleures offres en vidéo sur DealCity. Le shopping en action.",
};

export default function VideoPage() {
  return (
    <main className="flex w-full min-w-0 gap-6 items-start">
      <div className="w-full min-w-0 space-y-6">
        
        {/* HEADER DE LA PAGE RE-DESIGNÉ */}
        <div className="rounded-[22px] bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-sm border border-slate-200/60 dark:border-zinc-800/50 overflow-hidden relative">
          {/* Lueur subtile en arrière-plan */}
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#4a90e2]/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex size-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#4a90e2] items-center justify-center shrink-0">
                <Film className="size-6" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
                  Shopping Vidéo
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed">
                  Découvrez les articles en action à travers les démonstrations réelles de la communauté.
                </p>
              </div>
            </div>

            {/* BADGE "LIVE" EN TEXTE ANIMÉ */}
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-1 rounded-full shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">LIVE</span>
            </div>
          </div>
        </div>
        
        {/* LE FLUX DE VIDÉOS IMMERSIF */}
        <VideoFeed />
      </div>
      
      {/* SIDEBAR DES TENDANCES (Seulement sur écran d'ordinateur) */}
      <TrendsSidebar className="hidden lg:block shrink-0 w-80 sticky top-[5.5rem]" />
    </main>
  );
}