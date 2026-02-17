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
import { toast } from "sonner"; // Ou ton composant toast habituel

interface SellerDashboardProps {
  posts: PostData[];
  user: UserData;
}

export default function SellerDashboard({ posts, user }: SellerDashboardProps) {
  const [isPending, startTransition] = useTransition();

  // Calcul des statistiques
  const totalLikes = posts.reduce((acc, p) => acc + (p._count?.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p._count?.comments || 0), 0);
  
  // Extraction des interactions récentes (commentaires)
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
    // Vérification locale du solde avant l'appel serveur
    if ((user.balance || 0) < 500) {
      toast.error("Solde insuffisant", {
        description: "Veuillez recharger votre compte pour booster cet article."
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await boostPost(postId);
        if (result.success) {
          toast.success("🚀 Article propulsé !", {
            description: "Votre article est maintenant en tête de liste."
          });
        }
      } catch (error: any) {
        toast.error("Erreur", {
          description: error.message || "Impossible de booster l'article."
        });
      }
    });
  };
  
  return (
    <div className="w-full space-y-8 pb-10 px-0 md:px-4">
      <DashboardHeader user={user} />

      {/* 1. STATS QUICKVIEW */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 md:px-0">
        <QuickStat 
          title="Intérêt" 
          value={totalLikes.toString()} 
          icon={<Heart className="size-5" />} 
          color="rose"
          description="Total likes"
        />
        <QuickStat 
          title="Bavardages" 
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
          description="Articles actifs"
        />
        <QuickStat 
          title="Visibilité" 
          value="TOP" 
          icon={<Zap className="size-5" />} 
          color="amber"
          description="Score vendeur"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 px-4 md:px-0">
        
        {/* 2. FEED DES INTERACTIONS */}
        <Card className="border-none shadow-xl shadow-black/[0.02] bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-6">
            <CardTitle className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BellRing className="size-5" />
              </div>
              Derniers Prospecteurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-8">
            {recentInteractions.length > 0 ? (
              recentInteractions.map((item) => (
                <ProspectItem 
                  key={item.id}
                  name={item.userName} 
                  article={item.articleContent} 
                  time={formatRelativeDate(new Date(item.createdAt))} 
                />
              ))
            ) : (
              <div className="text-center py-10 bg-muted/20 rounded-[2rem] border border-dashed border-muted/50">
                <p className="text-xs text-muted-foreground italic">Aucun mouvement pour le moment.</p>
              </div>
            )}
            <div className="flex items-center justify-center pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 animate-pulse text-center">
                    🔥 Répondez vite pour conclure la vente
                </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. PROPULSEUR (BOOST) */}
        <Card className="border-none shadow-xl shadow-black/[0.02] bg-gradient-to-br from-card to-primary/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-6">
            <CardTitle className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
               <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <TrendingUp className="size-5" />
              </div>
              Propulseur d&apos;Articles
            </CardTitle>
            <Sparkles className="size-5 text-primary/40" />
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-8">
            {posts.length > 0 ? (
              posts.slice(0, 4).map((post) => (
                <div key={post.id} className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-background/60 border border-muted/50 hover:border-primary/30 transition-all">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold truncate leading-none mb-1.5 group-hover:text-primary transition-colors">
                      {post.content}
                    </span>
                    <div className="flex gap-3 items-center">
                      <span className="text-[10px] font-black text-muted-foreground/70 uppercase">{post._count?.comments || 0} avis</span>
                      <div className="size-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] font-black text-muted-foreground/70 uppercase">{post._count?.likes || 0} fans</span>
                    </div>
                  </div>

                  <button 
                    disabled={isPending}
                    onClick={() => handleBoost(post.id)}
                    className={cn(
                      "relative flex items-center justify-center bg-primary text-white h-10 px-4 rounded-xl text-[11px] font-black shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale",
                    )}
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4 mr-2" />}
                    {isPending ? "" : "BOOST"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6 italic uppercase tracking-widest font-bold">Lancez votre premier article !</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function ProspectItem({ name, article, time }: { name: string, article: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-all group">
      <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-[#83c5be] flex items-center justify-center text-white font-black text-xs shadow-md">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate text-foreground leading-none">{name}</p>
        <p className="text-[11px] text-muted-foreground truncate italic mt-1.5 group-hover:text-foreground transition-colors">&quot;{article}&quot;</p>
      </div>
      <div className="text-[9px] font-black text-muted-foreground/60 uppercase bg-muted/50 px-2 py-1 rounded-lg shrink-0">{time}</div>
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
    <Card className="border-none shadow-xl shadow-black/[0.02] bg-card rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:rotate-12 group-hover:scale-110", colorMap[color])}>
            {icon}
          </div>
          <span className="text-2xl font-black tracking-tighter leading-none">{value}</span>
        </div>
        <div className="mt-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none mb-1">{title}</p>
            <p className="text-[9px] font-bold text-muted-foreground/40 italic leading-none">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}