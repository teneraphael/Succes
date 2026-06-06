import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { fr } from "date-fns/locale";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookmarksFeed from "@/app/(main)/bookmarks/Bookmarks";
import ZoomableImage from "@/components/ZoomableImage";
import {
  Calendar,
  Store,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import ShareProfileButton from "./ShareProfileButton";
import MoreOptionsButton from "./MoreOptionsButton";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: "insensitive" },
    },
    select: getUserDataSelect(loggedInUserId),
  });
  if (!user) notFound();
  return user;
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { username } = await props.params;
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  try {
    const user = await getUser(username, loggedInUser.id);
    return { title: `${user.displayName} — DealCity` };
  } catch {
    return { title: "Profil introuvable" };
  }
}

export default async function Page(props: PageProps) {
  const { username } = await props.params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) redirect("/login");
  if (username.toLowerCase() === "me") redirect(`/users/${loggedInUser.username}`);

  const user = await getUser(username, loggedInUser.id);
  const isUserProfile = user.id === loggedInUser.id;

  return (
    <main className="flex w-full min-w-0 gap-0 lg:gap-8 items-start">
      <div className="w-full min-w-0 flex-1 space-y-4 lg:space-y-6">
        <UserProfile user={user as any} loggedInUserId={loggedInUser.id} />

        <div className="w-full">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="bg-card border border-border/60 p-1.5 rounded-2xl flex items-center gap-1.5 w-full shadow-sm">
              <TabsTrigger
                value="posts"
                className="flex-1 py-2.5 px-4 rounded-xl text-muted-foreground text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-none data-[state=active]:bg-background data-[state=active]:text-[#4a90e2] data-[state=active]:border data-[state=active]:border-[#4a90e2]/20 data-[state=active]:shadow-sm"
              >
                <Store className="size-3.5 text-[#4a90e2]" />
                Catalogue
              </TabsTrigger>

              {isUserProfile && (
                <TabsTrigger
                  value="bookmarks"
                  className="flex-1 py-2.5 px-4 rounded-xl text-muted-foreground text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-none data-[state=active]:bg-background data-[state=active]:text-rose-500 data-[state=active]:border data-[state=active]:border-rose-500/20 data-[state=active]:shadow-sm"
                >
                  <Heart className="size-3.5 text-rose-400" />
                  Favoris
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="posts" className="outline-none pt-4 w-full">
              <UserPosts userId={user.id} />
            </TabsContent>

            {isUserProfile && (
              <TabsContent value="bookmarks" className="outline-none pt-5 w-full">
                <BookmarksFeed />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData & { coverUrl?: string | null; saleCount?: number };
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  const isAdmin = user.username.toLowerCase() === "dealcity";

  return (
    <div className="w-full bg-card text-foreground rounded-none sm:rounded-3xl overflow-hidden border border-border/60 shadow-sm relative">

      {/* Bannière */}
      <div className="h-36 sm:h-52 w-full relative overflow-hidden">
        {user.coverUrl ? (
          <ZoomableImage
            src={user.coverUrl}
            alt="Bannière de couverture"
            fill
            priority
            className="object-cover cursor-zoom-in"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f3a] via-[#1a3a6b] to-[#0d4a8a]">
            {/* Grille de points */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* Barres logo DealCity en filigrane */}
            <div className="absolute bottom-4 right-6 flex items-end gap-[6px] opacity-10">
              <div className="w-3 h-8 bg-white rounded-sm" />
              <div className="w-3 h-14 bg-white rounded-sm" />
              <div className="w-3 h-18 bg-white rounded-sm" />
              <div className="w-3 h-10 bg-white rounded-sm" />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-[#4a90e2]/20 blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-[#6ab344]/10 blur-2xl" />
          </div>
        )}

        {/* Badge en ligne */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <span className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          En ligne
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 -mt-14 relative z-10 space-y-4">

        {/* Avatar + boutons */}
        <div className="flex items-end justify-between gap-3">
          <div className="relative">
            <div className="p-[3px] rounded-full bg-gradient-to-br from-[#4a90e2] to-[#6ab344] shadow-lg shadow-[#4a90e2]/20">
              <div className="p-0.5 bg-card rounded-full">
                <ZoomableImage
                  src={user.avatarUrl || "/icons/icon-192.png"}
                  alt="Avatar"
                  size={96}
                  className="size-20 sm:size-24 rounded-full object-cover cursor-zoom-in"
                />
              </div>
            </div>
            {isAdmin && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#4a90e2] text-white text-[8px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md uppercase tracking-widest whitespace-nowrap">
                <ShieldCheck className="size-2.5 stroke-[3]" /> Admin
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pb-1">
            {user.id === loggedInUserId ? (
              <EditProfileButton user={user} />
            ) : (
              <FollowButton userId={user.id} initialState={followerInfo} />
            )}
            <ShareProfileButton username={user.username} />
            <MoreOptionsButton />
          </div>
        </div>

        {/* Nom + username */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-foreground leading-none">
            {user.displayName}
            {isAdmin && (
              <CheckCircle2 className="size-[18px] text-[#4a90e2] fill-[#4a90e2]/15 stroke-[2.5] shrink-0" />
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            <span className="text-[#4a90e2] font-bold">@{user.username}</span>
            <span className="text-border/70 select-none">·</span>
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Calendar className="size-3 opacity-60" />
              Membre depuis{" "}
              {formatDate(user.createdAt, "MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-background border border-[#4a90e2]/10 shadow-sm">
          <div className="shrink-0 px-2 py-0.5 bg-[#4a90e2]/10 border border-[#4a90e2]/20 rounded-lg text-[8px] font-black text-[#4a90e2] tracking-widest uppercase mt-0.5">
            Market
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed flex-1">
            {user.bio ? (
              <Linkify>{user.bio}</Linkify>
            ) : (
              "Marketplace & réseau social — Achetez, vendez, connectez-vous."
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 pt-0.5 max-w-md">
          {/* Créations */}
          <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#4a90e2]/30">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#4a90e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
            <div className="text-xl font-black text-foreground tabular-nums">
              {formatNumber(user._count.posts)}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Créations
            </div>
          </div>

          {/* Abonnés */}
          <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#4a90e2]/30">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#4a90e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
            <div className="text-xl font-black text-foreground tabular-nums">
              <FollowerCount userId={user.id} initialState={followerInfo} />
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Abonnés
            </div>
          </div>

          {/* Ventes */}
          <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#6ab344]/30">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#6ab344] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
            <div className="text-xl font-black text-foreground tabular-nums flex items-center justify-center gap-1.5">
              <ShoppingBag className="size-4 text-[#6ab344] shrink-0" />
              {user.saleCount || 0}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Ventes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}