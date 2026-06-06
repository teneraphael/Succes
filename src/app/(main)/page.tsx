import { validateRequest } from "@/auth";
import TrendsSidebar from "@/components/TrendsSidebar";
import FeedTabs from "@/components/FeedTabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import WelcomeMessage from "./WelcomeMessage";
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <main className="flex w-full min-w-0 gap-5 min-h-screen">
      <div className="w-full min-w-0 space-y-4">

        {/* ✅ Message de bienvenue — affiché uniquement aux non-vendeurs */}
        {!user?.isSeller && <WelcomeMessage />}

        <FeedTabs
          userId={user?.id}
          forYouFeed={<ForYouFeed userId={user?.id} />}
          followingFeed={
            user ? (
              <FollowingFeed />
            ) : (
              // ✅ Bloc "Section privée" — style DealCity bleu/vert
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-3xl border border-[#4a90e2]/15 text-center space-y-5 shadow-sm max-w-xl mx-auto">

                {/* Icône cadenas */}
                <div className="relative">
                  <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
                    <Lock className="size-7 text-[#4a90e2]" />
                  </div>
                  {/* Point vert DealCity */}
                  <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-card" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-foreground">
                    Section privée
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                    Connectez-vous pour voir les publications des vendeurs que vous suivez.
                  </p>
                </div>

                {/* ✅ Bouton connexion — bleu DealCity */}
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-lg shadow-[#4a90e2]/25 hover:scale-105 active:scale-95 transition-all"
                >
                  Se connecter maintenant
                </Link>

                {/* ✅ Badge DealCity */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
                  <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    DealCity
                  </span>
                </div>
              </div>
            )
          }
        />
      </div>

      {/* ✅ Sidebar tendances — sticky desktop uniquement */}
      <div className="sticky top-[5.25rem] h-fit hidden xl:block w-80">
        <TrendsSidebar />
      </div>
    </main>
  );
}