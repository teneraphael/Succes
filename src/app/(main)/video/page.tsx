import { Metadata } from "next";
import VideoFeed from "./VideoFeed";
import TrendsSidebar from "@/components/TrendsSidebar";

export const metadata: Metadata = {
  title: "Vidéos - DealCity",
  description: "Découvrez les meilleures offres en vidéo",
};

export default function VideoPage() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-[#4a90e2]">Shopping Vidéo</h1>
          <p className="text-muted-foreground text-sm">Découvrez les articles en action</p>
        </div>
        
        {/* Le flux de vidéos plein écran ou format carte */}
        <VideoFeed />
      </div>
      
      {/* On garde la sidebar pour les tendances sur Desktop */}
      <TrendsSidebar className="hidden lg:block" />
    </main>
  );
}