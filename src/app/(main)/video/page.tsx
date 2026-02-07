import { Metadata } from "next";
import VideoFeed from "./VideoFeed";
import TrendsSidebar from "@/components/TrendsSidebar";

export const metadata: Metadata = {
  title: "Vidéos - DealCity",
  description: "Découvrez les meilleures offres en vidéo sur DealCity. Le shopping en action.",
};

export default function VideoPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* Header de la page */}
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#4a90e2]">Shopping Vidéo</h1>
              <p className="text-muted-foreground text-sm">
                Découvrez les articles en action à travers les vidéos de la communauté
              </p>
            </div>
            {/* Petit badge décoratif ou indicateur "Live" */}
            <div className="hidden sm:block">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Le flux de vidéos */}
        <VideoFeed />
      </div>
      
      {/* Sidebar pour les tendances sur Desktop */}
      <TrendsSidebar className="hidden lg:block shrink-0 w-80" />
    </main>
  );
}