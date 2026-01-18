import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import WelcomeMessage from "./WelcomeMessage"; // On va créer ce composant

export default async function Home() {
  const { user } = await validateRequest(); 

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        
        {/* Affichage conditionnel : Si vendeur -> Editor, sinon -> Message Temporaire */}
        {user?.isSeller ? (
          <PostEditor />
        ) : (
          <WelcomeMessage />
        )}

        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
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