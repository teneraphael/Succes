"use client";

import { UserData, PostData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, Heart, TrendingUp, Rocket, 
  Loader2, Package, Sparkles, Zap, BellRing 
} from "lucide-react";
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
    <div className="w-full space-y-6 pb-10">
      <DashboardHeader user={user} />

      {/* 1. STATS : GRILLE AVEC ALIGNEMENT START POUR ÉVITER L'ÉTIREMENT */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 md:px-0 items-start">
        <QuickStat 
          title="Intérêt" 
          value={totalLikes.toString()} 
          icon={<Heart className="size-5" />} 
          color="rose"
          description="Total likes"
        />
        <QuickStat 
          title="Avis" 
          value={totalComments.toString()} 
          icon={<MessageCircle className="size-5" />} 
          color="primary"
          description="Commentaires"
        />
        <QuickStat 
          title="Stock" 
          value={posts.length.toString()} 
          icon={<Package className="size-5" />} 
          color="blue"
          description="Articles"
        />
        <QuickStat 
          title="Visibilité" 
          value="TOP" 
          icon={<Zap className="size-5" />} 
          color="amber"
          description="Score"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 px-4 md:px-0 items-start">
        
        {/* 2. INTERACTIONS FEED */}
        <Card className="border-none shadow-xl shadow-black/[0.03] bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                <BellRing className="size-4" />
              </div>
              Prospecteurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-8">
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
              <div className="text-center py-10 bg-muted/10 rounded-[2rem] border border-dashed border-muted">
                <p className="text-xs text-muted-foreground italic tracking-tight">Aucun mouvement.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. BOOST ENGINE */}
        <Card className="border-none shadow-xl shadow-black/[0.03] bg-gradient-to-br from-card to-primary/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-6">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
               <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-500">
                <TrendingUp className="size-4" />
              </div>
              Propulsion
            </CardTitle>
            <Sparkles className="size-4 text-primary/40" />
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-8">
            {posts.length > 0 ? (
              posts.slice(0, 4).map((post) => (
                <div key={post.id} className="group flex items-center justify-between gap-4 p-4 rounded-[1.8rem] bg-background/40 border border-muted/30 hover:border-primary/30 transition-all hover:bg-background/80">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                      {post.content}
                    </span>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">{post._count?.comments || 0} avis</span>
                      <div className="size-1 rounded-full bg-muted-foreground/20" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">{post._count?.likes || 0} likes</span>
                    </div>
                  </div>

                  <button 
                    disabled={isPending}
                    onClick={() => handleBoost(post.id)}
                    className="relative flex items-center justify-center bg-primary text-white h-11 w-11 md:w-auto md:px-5 rounded-2xl text-[11px] font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4 md:mr-2" />}
                    <span className="hidden md:inline">{isPending ? "" : "BOOST"}</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6 italic">Aucun article.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProspectItem({ name, article, time }: { name: string, article: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-muted/5 border border-transparent hover:border-primary/10 transition-all group">
      <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-sm shadow-inner shrink-0">
        {name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-foreground leading-none">{name}</p>
        <p className="text-[11px] text-muted-foreground truncate italic mt-1.5">&quot;{article}&quot;</p>
      </div>
      <div className="text-[9px] font-black text-muted-foreground/60 uppercase bg-muted/20 px-2 py-1.5 rounded-xl shrink-0">{time}</div>
    </div>
  );
}

function QuickStat({ title, value, icon, color, description }: { title: string, value: string, icon: React.ReactNode, color: string, description: string }) {
  const colorMap: any = {
    rose: "bg-rose-500/10 text-rose-500",
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500"
  };

  return (
    <Card className="border-none shadow-xl shadow-black/[0.02] bg-card rounded-[2rem] overflow-hidden group hover:bg-muted/5 transition-all h-fit">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110", colorMap[color])}>
            {icon}
          </div>
          <div className="flex flex-col items-end min-w-0">
             <span className="text-xl md:text-2xl font-black tracking-tighter leading-none">{value}</span>
             <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-tight mt-1">{title}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-muted/20">
            <p className="text-[9px] font-bold text-muted-foreground/30 truncate italic leading-none">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}