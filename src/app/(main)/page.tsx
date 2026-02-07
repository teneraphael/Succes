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
      <div className="w-full min-w-0 space-y-5">
        
        {/* Affiché pour les visiteurs anonymes OU les acheteurs (non-vendeurs) */}
        {!user?.isSeller && <WelcomeMessage />}

        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="bg-card border rounded-full p-1 h-12">
            <TabsTrigger value="for-you" className="rounded-full px-8 font-bold">
              Pour vous
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-full px-8 font-bold">
              Abonnements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you" className="mt-4">
            {/* Ouvert à tout le monde */}
            <ForYouFeed userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            {user ? (
              <FollowingFeed />
            ) : (
              /* MESSAGE SI NON CONNECTÉ SUR L'ONGLET ABONNEMENTS */
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-[2.5rem] border border-dashed border-primary/20 text-center space-y-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Lock size={30} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Section privée</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Connectez-vous pour voir les publications des vendeurs que vous suivez.
                  </p>
                </div>
                <Link 
                  href="/login" 
                  className="bg-primary text-white px-8 py-3 rounded-full font-black uppercase italic text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
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