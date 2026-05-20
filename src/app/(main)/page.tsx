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
    // Ajout de 'min-h-screen' pour assurer que le flux a assez de hauteur pour scroller
    <main className="flex w-full min-w-0 gap-5 min-h-screen">
      <div className="w-full min-w-0 space-y-4">
        {!user?.isSeller && <WelcomeMessage />}

        <FeedTabs 
          userId={user?.id}
          forYouFeed={<ForYouFeed userId={user?.id} />}
          followingFeed={user ? <FollowingFeed /> : (
            <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-[2.5rem] border border-dashed border-primary/20 text-center space-y-5 shadow-sm max-w-xl mx-auto">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Lock size={26} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Section privée</h3>
                <p className="text-muted-foreground text-xs font-semibold max-w-[260px] mx-auto leading-relaxed">
                  Connectez-vous pour voir les publications des vendeurs que vous suivez.
                </p>
              </div>
              <Link 
                href="/login" 
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-black uppercase italic text-xs tracking-widest shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all block"
              >
                Se connecter maintenant
              </Link>
            </div>
          )}
        />
      </div>
      
      {/* Le sidebar est sticky aussi sur desktop, ce qui est une bonne pratique */}
      <div className="sticky top-0 h-fit hidden xl:block w-80">
        <TrendsSidebar />
      </div>
    </main>
  );
}