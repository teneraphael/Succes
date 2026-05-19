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
import { Calendar, Store, Heart, Package, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import ShareProfileButton from "./ShareProfileButton";
import MoreOptionsButton from "./MoreOptionsButton";

interface PageProps {
  params: Promise<{ username: string }>;
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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { username } = await props.params;
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  try {
    const user = await getUser(username, loggedInUser.id);
    return { title: `${user.displayName} — DealCity` };
  } catch (error) {
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
      {/* Ajout de flex-1 pour occuper toute la largeur disponible */}
      <div className="w-full min-w-0 flex-1 space-y-6 lg:space-y-8">
        
        {/* COMPOSANT PROFIL MAQUETTÉ */}
        <UserProfile user={user as any} loggedInUserId={loggedInUser.id} />
        
        {/* Suppression du padding horizontal pour aligner les onglets avec le profil */}
        <div className="w-full">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="bg-[#f1f5f9] border border-slate-200/60 p-1 rounded-2xl flex items-center gap-1 shadow-sm w-full">
              <TabsTrigger 
                value="posts" 
                className="flex-1 py-2.5 px-3 rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-slate-200/80 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-none"
              >
                <Store className="size-4 text-[#00b272]" /> Catalogue
              </TabsTrigger>
              
              {isUserProfile && (
                <>
                  <TabsTrigger 
                    value="orders" 
                    className="flex-1 py-2.5 px-3 rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-slate-200/80 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-none"
                  >
                    <Package className="size-4" /> Commandes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bookmarks" 
                    className="flex-1 py-2.5 px-3 rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border data-[state=active]:border-slate-200/80 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-none"
                  >
                    <Heart className="size-4" /> Favoris
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="posts" className="outline-none pt-6 w-full">
              <UserPosts userId={user.id} />
            </TabsContent>

            {isUserProfile && (
              <>
                <TabsContent value="orders" className="outline-none pt-6 w-full">
                  <OrderConfirmationList userId={user.id} />
                </TabsContent>
                <TabsContent value="bookmarks" className="outline-none pt-6 w-full">
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
  user: UserData & { coverUrl?: string | null };
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
    <div className="w-full bg-slate-50 text-slate-800 rounded-none sm:rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm relative">
      <div className="h-36 sm:h-48 w-full relative bg-slate-200 overflow-hidden border-b border-slate-200/40">
        {user.coverUrl ? (
          <Image src={user.coverUrl} alt="Bannière de couverture" fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/50">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="px-4 sm:px-6 pb-6 -mt-12 relative z-10 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div className="relative">
            <div className="p-1 bg-white rounded-full border border-slate-200/80 shadow-md">
              <UserAvatar avatarUrl={user.avatarUrl} size={100} className="size-20 sm:size-24 rounded-full object-cover" />
            </div>
            {user.username.toLowerCase() === "dealcity" && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00b272] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <ShieldCheck className="size-2.5 stroke-[3]" /> Admin
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user.id === loggedInUserId ? <EditProfileButton user={user} /> : <FollowButton userId={user.id} initialState={followerInfo} />}
            <ShareProfileButton username={user.username} />
            <MoreOptionsButton />
          </div>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 text-slate-900">
            {user.displayName}
            {user.username.toLowerCase() === "dealcity" && <CheckCircle2 className="size-4 text-purple-500 fill-purple-500/10 stroke-[2.5]" />}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
            <span className="text-[#00b272]">@{user.username}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="size-3.5 opacity-70" /> Membre depuis {formatDate(user.createdAt, "MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3 shadow-sm">
          <div className="px-2 py-0.5 bg-purple-50 border border-purple-100 rounded text-[9px] font-black text-purple-600 tracking-wider uppercase shrink-0">Marketplace</div>
          <div className="text-xs text-slate-600 font-medium leading-relaxed flex-1">
            {user.bio ? <Linkify>{user.bio}</Linkify> : "Marketplace & réseau social — Achetez, vendez, connectez-vous."}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 max-w-md">
          <div className="p-3 bg-white border border-slate-200/60 rounded-xl text-center space-y-0.5 shadow-sm">
            <div className="text-lg font-black text-slate-900">{formatNumber(user._count.posts)}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Créations</div>
          </div>
          <div className="p-3 bg-white border border-slate-200/60 rounded-xl text-center space-y-0.5 shadow-sm">
            <div className="text-lg font-black text-slate-900"><FollowerCount userId={user.id} initialState={followerInfo} /></div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Abonnés</div>
          </div>
        </div>
      </div>
    </div>
  );
}