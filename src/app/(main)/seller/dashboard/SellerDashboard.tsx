"use client";

import { UserData, PostData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle, Heart, TrendingUp, TrendingDown, Rocket,
  Loader2, Package, Sparkles, Zap, BellRing, Eye,
} from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import { useTransition } from "react";
import { boostPost } from "./actions";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// ✅ Interface monthlyStats ajoutée
interface MonthlyStats {
  views: { current: number; previous: number; variation: number };
  whatsapp: { current: number; previous: number; variation: number };
  likes: { current: number; previous: number; variation: number };
  comments: { current: number; previous: number; variation: number };
  totalViews: number;
  totalLikes: number;
  totalProducts: number;
}

interface SellerDashboardProps {
  posts: PostData[];
  user: UserData;
  monthlyStats: MonthlyStats;
}

export default function SellerDashboard({ posts, user, monthlyStats }: SellerDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const totalLikes = posts.reduce((acc, p) => acc + (p._count?.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p._count?.comments || 0), 0);

  const recentInteractions = posts
    .flatMap(post =>
      ((post as any).comments || []).map((comment: any) => ({
        id: comment.id,
        userName: comment.user.displayName,
        articleContent: post.content,
        createdAt: comment.createdAt,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleBoost = (postId: string) => {
    startTransition(async () => {
      try {
        const result = await boostPost(postId);
        if (result.success) {
          toast({
            description: "Article propulse en tete de liste !",
            className: "bg-primary text-white border-none rounded-2xl shadow-xl",
          });
        } else {
          toast({ variant: "destructive", description: result.error || "Erreur lors du boost" });
        }
      } catch {
        toast({ variant: "destructive", description: "Une erreur est survenue. Verifiez votre solde Boost." });
      }
    });
  };

  const monthName = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="w-full space-y-6 pb-10">

      {/* Header */}
      <DashboardHeader user={user} />

      {/* ✅ Stats mensuelles avec variation vs mois précédent */}
      <div className="px-4 md:px-0 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 capitalize">
          {monthName}
        </p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MonthlyStatCard
            icon={<Eye className="size-4 text-[#4a90e2]" />}
            label="Vues"
            current={monthlyStats.views.current}
            variation={monthlyStats.views.variation}
            color="bg-[#4a90e2]/10"
          />
          <MonthlyStatCard
            icon={
              <svg viewBox="0 0 24 24" className="size-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            }
            label="WhatsApp"
            current={monthlyStats.whatsapp.current}
            variation={monthlyStats.whatsapp.variation}
            color="bg-[#25D366]/10"
          />
          <MonthlyStatCard
            icon={<Heart className="size-4 text-rose-500" />}
            label="Likes"
            current={monthlyStats.likes.current}
            variation={monthlyStats.likes.variation}
            color="bg-rose-500/10"
          />
          <MonthlyStatCard
            icon={<MessageCircle className="size-4 text-amber-500" />}
            label="Commentaires"
            current={monthlyStats.comments.current}
            variation={monthlyStats.comments.variation}
            color="bg-amber-500/10"
          />
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 md:px-0 items-start">
        <QuickStat
          title="Interet"
          value={totalLikes.toLocaleString()}
          icon={<Heart className="size-5" />}
          color="rose"
          description="Total likes cumules"
        />
        <QuickStat
          title="Avis"
          value={totalComments.toLocaleString()}
          icon={<MessageCircle className="size-5" />}
          color="primary"
          description="Commentaires clients"
        />
        <QuickStat
          title="Stock"
          value={posts.length.toString()}
          icon={<Package className="size-5" />}
          color="blue"
          description="Articles en ligne"
        />
        <QuickStat
          title="Visibilite"
          value="TOP"
          icon={<Zap className="size-5" />}
          color="amber"
          description="Score d'activite"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 px-4 md:px-0 items-start">

        {/* Interactions récentes */}
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
                <p className="text-xs text-muted-foreground italic tracking-tight">Aucune interaction recente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boost Engine */}
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
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="group flex items-center justify-between gap-4 p-4 rounded-[1.8rem] bg-background/40 border border-muted/30 hover:border-primary/30 transition-all hover:bg-background/80 shadow-sm">
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
              <p className="text-xs text-muted-foreground text-center py-6 italic">Aucun article disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ✅ Carte stat mensuelle avec variation
function MonthlyStatCard({
  icon, label, current, variation, color,
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  variation: number;
  color: string;
}) {
  const isPositive = variation >= 0;
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`size-8 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${
          isPositive ? "bg-[#6ab344]/10 text-[#6ab344]" : "bg-red-500/10 text-red-500"
        }`}>
          {isPositive
            ? <TrendingUp className="size-3" />
            : <TrendingDown className="size-3" />
          }
          {Math.abs(variation)}%
        </div>
      </div>
      <div>
        <p className="text-xl font-black text-foreground tabular-nums">{current.toLocaleString()}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ProspectItem({ name, article, time }: { name: string; article: string; time: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-muted/5 border border-transparent hover:border-primary/10 transition-all group">
      <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-sm shadow-inner shrink-0 uppercase">
        {name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-foreground leading-none">{name}</p>
        <p className="text-[11px] text-muted-foreground truncate italic mt-1.5">
          &quot;{article}&quot;
        </p>
      </div>
      <div className="text-[9px] font-black text-muted-foreground/60 uppercase bg-muted/20 px-2 py-1.5 rounded-xl shrink-0">
        {time}
      </div>
    </div>
  );
}

function QuickStat({ title, value, icon, color, description }: {
  title: string; value: string; icon: React.ReactNode; color: string; description: string;
}) {
  const colorMap: any = {
    rose: "bg-rose-500/10 text-rose-500",
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <Card className="border-none shadow-xl shadow-black/[0.02] bg-card rounded-[2rem] overflow-hidden group hover:bg-muted/5 transition-all h-fit">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110", colorMap[color])}>
            {icon}
          </div>
          <div className="flex flex-col items-end min-w-0 text-right">
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