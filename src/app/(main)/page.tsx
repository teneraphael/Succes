import { validateRequest } from "@/auth";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import WelcomeMessage from "./WelcomeMessage"; 

export default async function Home() {
  const { user } = await validateRequest(); 

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        
        {/* On n'affiche le WelcomeMessage que si l'utilisateur n'est pas vendeur.
            C'est ici qu'il trouvera probablement le bouton pour s'inscrire comme vendeur.
        */}
        {!user?.isSeller && <WelcomeMessage />}

        <Tabs defaultValue="for-you">
          <TabsList className="bg-card border">
            <TabsTrigger value="for-you">Pour vous</TabsTrigger>
            <TabsTrigger value="following">Abonnements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you">
            {/* On passe l'ID user pour l'algorithme de recommandation */}
            <ForYouFeed userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Barre latérale avec les tendances/hashtags */}
      <TrendsSidebar />
    </main>
  );
}