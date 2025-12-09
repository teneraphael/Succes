import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";

export default function Home() {
  return (
    <main className="flex flex-col w-full gap-0 md:flex-row">
      <div className="flex-grow w-full p-2"> {/* Utilise padding pour éviter que le contenu touche les bords */}
        <PostEditor />
        <Tabs defaultValue="for-you">
          <TabsList className="flex gap-2 mb-2"> {/* Ajoute un espace entre les onglets */}
            <TabsTrigger value="for-you" className="flex-1">For you</TabsTrigger>
            <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden md:block flex-none w-1/4"> {/* Sidebar visible seulement sur les écrans moyens et plus */}
        <TrendsSidebar />
      </div>
    </main>
  );
}
