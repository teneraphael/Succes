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
import OrderConfirmationList from "./OrderConfirmationList";
import { Calendar, Store, Heart, Package, ArrowUpRight } from "lucide-react";

interface PageProps {
  params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();
  return user;
});

export async function generateMetadata({ params: { username } }: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  try {
    const user = await getUser(username, loggedInUser.id);
    return { title: `${user.displayName} — DealCity` };
  } catch (error) {
    return { title: "Profil introuvable" };
  }
}

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) redirect("/login");
  if (username.toLowerCase() === "me") redirect(`/users/${loggedInUser.username}`);

  const user = await getUser(username, loggedInUser.id);
  const isUserProfile = user.id === loggedInUser.id;

  return (
    <main className="flex w-full min-w-0 gap-0 lg:gap-8 items-start">
      <div className="w-full min-w-0 space-y-6 lg:space-y-8">
        
        {/* COMPOSANT PROFIL AVEC IDENTITÉ PREMIUM ET RESPONSIVE */}
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        
        {/* NAVIGATION ASSOCIEE À L'IDENTITÉ ÉDITORIALE */}
        <div className="px-4 sm:px-6 lg:px-0">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto gap-6 sm:gap-10 overflow-x-auto scrollbar-none">
              <TabsTrigger 
                value="posts" 
                className="px-0 py-4 bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-amber-600 font-bold text-sm tracking-tight flex items-center gap-2 transition-all opacity-60 data-[state=active]:opacity-100 shadow-none"
              >
                <Store className="size-4" /> Catalogue
              </TabsTrigger>
              
              {isUserProfile && (
                <>
                  <TabsTrigger 
                    value="orders" 
                    className="px-0 py-4 bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-amber-600 font-bold text-sm tracking-tight flex items-center gap-2 transition-all opacity-60 data-[state=active]:opacity-100 shadow-none"
                  >
                    <Package className="size-4" /> Commandes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bookmarks" 
                    className="px-0 py-4 bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-amber-600 font-bold text-sm tracking-tight flex items-center gap-2 transition-all opacity-60 data-[state=active]:opacity-100 shadow-none"
                  >
                    <Heart className="size-4" /> Favoris
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="posts" className="outline-none pt-6">
              <UserPosts userId={user.id} />
            </TabsContent>

            {isUserProfile && (
              <>
                <TabsContent value="orders" className="outline-none pt-6">
                  <OrderConfirmationList userId={user.id} />
                </TabsContent>
                <TabsContent value="bookmarks" className="outline-none pt-6">
                  <BookmarksFeed />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    /* rounded-none sur mobile, bords arrondis élégants sur grand écran, fond ultra clair et lumineux */
    <div className="w-full bg-white dark:bg-card border-b sm:border border-border/80 rounded-none sm:rounded-3xl p-6 md:p-10 shadow-[0_2px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
      
      {/* Filigrane d'identité en arrière-plan (très discret, ton sur ton) */}
      <div className="absolute -bottom-10 -right-10 text-[10rem] font-black text-muted-foreground/[0.03] select-none pointer-events-none font-sans hidden sm:block">
        DC
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start relative z-10">
        
        {/* SECTIONS VISUELLE : L'AVATAR ET SON COMPTEUR FLOTTANT */}
        <div className="relative shrink-0">
          <div className="relative p-1 bg-background border rounded-full">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={140}
              className="size-32 md:size-36 rounded-full object-cover"
            />
          </div>
          {/* Badge asymétrique chevauchant l'avatar */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap shadow-sm border border-background">
            {formatNumber(user._count.posts)} Créations
          </div>
        </div>

        {/* CONTENU TEXTUEL : ARCHITECTURE ÉDITORIALE */}
        <div className="flex-1 space-y-6 w-full">
          
          {/* LIGNE DE TÊTE : INFOS ET BOUTONS */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground font-sans">
                {user.displayName}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
                <span className="font-medium text-amber-600 dark:text-amber-500 tracking-wide">@{user.username}</span>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Calendar className="size-3.5 opacity-60" />
                  Depuis {formatDate(user.createdAt, "MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>

            {/* ACTION TRIGGER (SUIVRE / CONFIGURER) */}
            <div className="shrink-0 w-full sm:w-auto">
              {user.id === loggedInUserId ? (
                <EditProfileButton user={user} />
              ) : (
                <FollowButton userId={user.id} initialState={followerInfo} />
              )}
            </div>
          </div>

          {/* COMPTEUR DE COMMUNAUTÉ SOUS FORME DE COMPOSANT MINIMALISTE */}
          <div className="flex items-center justify-center sm:justify-start gap-8 pt-2 border-t border-border/60">
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>

          {/* LA BIOGRAPHIE PRÉSENTÉE COMME UNE NOTE SIGNÉE */}
          {user.bio && (
            <div className="pt-2 text-center sm:text-left border-t border-dashed border-border">
              <Linkify>
                <p className="whitespace-pre-line break-words text-sm text-foreground/80 leading-relaxed font-serif italic max-w-2xl">
                  {user.bio}
                </p>
              </Linkify>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}