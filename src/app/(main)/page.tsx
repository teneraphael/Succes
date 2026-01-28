import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
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
        
        {/* Si vendeur -> Editeur, Sinon -> Message de bienvenue */}
        {user?.isSeller ? (
          <PostEditor />
        ) : (
          <WelcomeMessage />
        )}

        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">Pour vous</TabsTrigger>
            <TabsTrigger value="following">Abonnements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you">
            {/* ✅ IMPORTANT : On passe l'ID user pour l'algo de recommandation */}
            <ForYouFeed userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}