import { validateRequest } from "@/auth";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import WelcomeMessage from "./WelcomeMessage"; 
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function Home() {
  const { user } = await validateRequest(); 

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-4">
        
        {/* Affiché pour les visiteurs anonymes OU les acheteurs (non-vendeurs) */}
        {!user?.isSeller && <WelcomeMessage />}

        {/* ONGLETS MODERNES STYLE FLUX SOCIAL */}
        <Tabs defaultValue="for-you" className="w-full">
          
          {/* BARRE FLOTTANTE : Fixée au défilement avec un effet flou transparent de qualité supérieure */}
          <div className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl py-2.5 transition-all">
            <TabsList className="bg-muted/75 border border-border/20 p-1 h-11 max-w-[280px] sm:max-w-xs mx-auto flex rounded-full shadow-inner select-none">
              
              <TabsTrigger 
                value="for-you" 
                className="flex-1 rounded-full text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                Pour vous
              </TabsTrigger>
              
              <TabsTrigger 
                value="following" 
                className="flex-1 rounded-full text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                Abonnements
              </TabsTrigger>
              
            </TabsList>
          </div>
          
          {/* FLUX POUR VOUS */}
          <TabsContent value="for-you" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Ouvert à tout le monde */}
            <ForYouFeed userId={user?.id} />
          </TabsContent>
          
          {/* FLUX ABONNEMENTS */}
          <TabsContent value="following" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-3 duration-300">
            {user ? (
              <FollowingFeed />
            ) : (
              /* MESSAGE SI NON CONNECTÉ SUR L'ONGLET ABONNEMENTS */
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
          </TabsContent>
        </Tabs>
      </div>
      
      <TrendsSidebar />
    </main>
  );
}