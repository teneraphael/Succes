import { Metadata } from "next";
import VideoFeed from "./VideoFeed";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Vidéos — DealCity",
  description: "Découvrez les meilleures offres en vidéo sur DealCity. Le shopping en action.",
};

export default function VideoPage() {
  return (
    <main className="flex w-full min-w-0 gap-6 items-start">
      <div className="w-full min-w-0 space-y-6">

        {/* ✅ En-tête page vidéo — couleurs DealCity (#4a90e2 bleu / #6ab344 vert) */}
        <div className="relative rounded-3xl bg-card border border-border/60 shadow-sm overflow-hidden p-5 md:p-6">

          {/* Dégradé décoratif DealCity en arrière-plan */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4a90e2]/5 via-transparent to-[#6ab344]/5" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-[#4a90e2]/8 to-transparent" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">

              {/* Icône Film — style DealCity */}
              <div className="hidden sm:flex size-11 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 text-[#4a90e2] items-center justify-center shrink-0">
                <Film className="size-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {/* Mini logo DealCity */}
                  <div className="flex items-end gap-[3px] opacity-60">
                    <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-3.5 bg-[#4a90e2] rounded-sm" />
                  </div>
                  <h1 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">
                    Shopping Vidéo
                  </h1>
                </div>
                <p className="text-muted-foreground text-xs max-w-xs leading-relaxed font-medium">
                  Découvrez les articles en action à travers les démonstrations de la communauté.
                </p>
              </div>
            </div>

            {/* Badge LIVE — rouge animé */}
            <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/15 px-3 py-1.5 rounded-full shrink-0">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Flux vidéos immersif */}
        <VideoFeed />
      </div>

      {/* ✅ Sidebar tendances — desktop uniquement */}
      <TrendsSidebar className="hidden lg:block shrink-0 w-80 sticky top-[5.5rem]" />
    </main>
  );
}