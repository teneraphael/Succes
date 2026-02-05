"use client";

import { UserData, PostData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Eye, Heart, Share2, TrendingUp, Rocket, Loader2, Package } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import { useTransition } from "react";
import { boostPost } from "./actions";
import { cn, formatRelativeDate } from "@/lib/utils";

export default function SellerDashboard({ posts, user }: { posts: PostData[], user: UserData }) {
  const [isPending, startTransition] = useTransition();
  
  // CALCUL DES STATS RÉELLES
  const totalLikes = posts.reduce((acc, p) => acc + (p._count?.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p._count?.comments || 0), 0);
  
  // EXTRACTION DES VRAIES INTERACTIONS (Commentaires)
  // On utilise (post as any) pour éviter l'erreur TS si ton include Prisma n'est pas encore mis à jour
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
    <div className="space-y-8 pb-10">
      <DashboardHeader user={user} />

      {/* 1. CHIFFRES RÉELS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <QuickStat 
          title="Intérêt Client" 
          value={totalLikes.toString()} 
          icon={<Heart className="text-red-500" />} 
          description="Total des likes"
        />
        <QuickStat 
          title="Discussions" 
          value={totalComments.toString()} 
          icon={<MessageCircle className="text-primary" />} 
          description="Commentaires reçus"
        />
        <QuickStat 
          title="Articles" 
          value={posts.length.toString()} 
          icon={<Package className="text-blue-500" />} 
          description="Annonces en ligne"
        />
        <QuickStat 
          title="Partages" 
          value="--" 
          icon={<Share2 className="text-orange-500" />} 
          description="Bientôt disponible"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. VRAIES INTERACTIONS RÉCENTES */}
        <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="size-5" /> Interactions Récentes
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune interaction récente sur vos articles.
              </p>
            )}
            <p className="text-[10px] text-center text-muted-foreground uppercase pt-2 font-black italic">
              Répondez vite pour conclure vos ventes !
            </p>
          </CardContent>
        </Card>

        {/* 3. ARTICLES RÉELS ET BOOST */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Gérer mes articles</CardTitle>
            <Rocket className={cn("size-4 text-primary", isPending ? "animate-spin" : "animate-bounce")} />
          </CardHeader>
          <CardContent className="space-y-4">
            {posts.length > 0 ? (
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-primary/10">
                  <div className="flex flex-col min-w-0 flex-1 mr-4">
                    <span className="text-sm font-bold truncate">{post.content}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-bold text-primary">{post._count?.comments || 0} avis</span>
                      <span className="text-[9px] text-muted-foreground">{post._count?.likes || 0} likes</span>
                    </div>
                  </div>

                  <button 
                    disabled={isPending}
                    onClick={() => handleBoost(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-95",
                      isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <TrendingUp className="size-3" />
                    )}
                    {isPending ? "BOOST..." : "BOOST"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun article trouvé.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProspectItem({ name, article, time }: { name: string, article: string, time: string }) {
  return (
    <div className="flex items-center justify-between border-b border-primary/10 pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-bold truncate">{name} a interagi :</p>
        <p className="text-xs text-muted-foreground truncate italic">&quot;{article}&quot;</p>
      </div>
      <div className="text-right whitespace-nowrap text-[10px] text-muted-foreground font-medium">{time}</div>
    </div>
  );
}

function QuickStat({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <span className="text-2xl font-black tracking-tighter">{value}</span>
        </div>
        <p className="text-[11px] font-bold uppercase text-muted-foreground leading-none">{title}</p>
        <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}