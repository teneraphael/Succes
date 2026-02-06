"use client";

import { UserData, PostData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Heart, Share2, TrendingUp, Rocket, Loader2, Package } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import { useTransition } from "react";
import { boostPost } from "./actions";
import { cn, formatRelativeDate } from "@/lib/utils";

export default function SellerDashboard({ posts, user }: { posts: PostData[], user: UserData }) {
  const [isPending, startTransition] = useTransition();
  
  const totalLikes = posts.reduce((acc, p) => acc + (p._count?.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p._count?.comments || 0), 0);
  
  const recentInteractions = posts
    .flatMap(post => 
      ((post as any).comments || []).map((comment: any) => ({
        id: comment.id,
        userName: comment.user.displayName,
        articleContent: post.content,
        createdAt: comment.createdAt
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleBoost = (postId: string) => {
    startTransition(async () => {
      try {
        await boostPost(postId);
      } catch (error) {
        alert("Erreur lors du boost");
      }
    });
  };
  
  return (
    <div className="space-y-6 pb-10 px-2 md:px-0">
      <DashboardHeader user={user} />

      {/* 1. STATS EN GRILLE : 2 colonnes sur mobile, 4 sur ordi */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <QuickStat 
          title="Intérêt" 
          value={totalLikes.toString()} 
          icon={<Heart className="size-4 text-red-500" />} 
          description="Total likes"
        />
        <QuickStat 
          title="Discussions" 
          value={totalComments.toString()} 
          icon={<MessageCircle className="size-4 text-primary" />} 
          description="Commentaires"
        />
        <QuickStat 
          title="Articles" 
          value={posts.length.toString()} 
          icon={<Package className="size-4 text-blue-500" />} 
          description="En ligne"
        />
        <QuickStat 
          title="Partages" 
          value="--" 
          icon={<Share2 className="size-4 text-orange-500" />} 
          description="Bientôt"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. INTERACTIONS RÉCENTES */}
        <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <MessageCircle className="size-4 text-primary" /> Interactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInteractions.length > 0 ? (
              recentInteractions.map((item: any) => (
                <ProspectItem 
                  key={item.id}
                  name={item.userName} 
                  article={item.articleContent} 
                  time={formatRelativeDate(new Date(item.createdAt))} 
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                Aucune interaction récente.
              </p>
            )}
            <p className="text-[9px] text-center text-muted-foreground uppercase font-black italic border-t border-primary/10 pt-2">
              Répondez vite pour vendre !
            </p>
          </CardContent>
        </Card>

        {/* 3. GESTION ARTICLES ET BOOST */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md">Mes Articles</CardTitle>
            <Rocket className={cn("size-4 text-primary", isPending ? "animate-spin" : "animate-bounce")} />
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.length > 0 ? (
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-card/50 hover:border-primary/20 transition-colors">
                  {/* min-w-0 et truncate sont essentiels pour le mobile */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold truncate leading-none mb-1">
                      {post.content}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-primary">{post._count?.comments || 0} avis</span>
                      <span className="text-[10px] text-muted-foreground">{post._count?.likes || 0} likes</span>
                    </div>
                  </div>

                  <button 
                    disabled={isPending}
                    onClick={() => handleBoost(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm shrink-0",
                      isPending ? "opacity-50" : "active:scale-90"
                    )}
                  >
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : <TrendingUp className="size-3" />}
                    {isPending ? "..." : "BOOST"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun article.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProspectItem({ name, article, time }: { name: string, article: string, time: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-primary/5 pb-2 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold truncate text-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground truncate italic opacity-80">&quot;{article}&quot;</p>
      </div>
      <div className="text-[9px] text-muted-foreground font-medium shrink-0">{time}</div>
    </div>
  );
}

function QuickStat({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter">{value}</span>
        </div>
        <p className="text-[10px] font-bold uppercase text-muted-foreground truncate">{title}</p>
        <p className="text-[8px] text-muted-foreground mt-0.5 truncate">{description}</p>
      </CardContent>
    </Card>
  );
}