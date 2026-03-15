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
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookmarksFeed from "@/app/(main)/bookmarks/Bookmarks"; 
import OrderConfirmationList from "./OrderConfirmationList";

interface PageProps {
  params: { username: string };
}

// --- RECUPERATION DE L'UTILISATEUR ---
const getUser = cache(async (username: string, loggedInUserId: string) => {
  // Si l'utilisateur tape "/users/me", on le redirige vers son vrai pseudo
  // Note: Cette logique est gérée ici mais idéalement via un fichier /users/me/page.tsx
  
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

// --- METADATA ---
export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  
  try {
    const user = await getUser(username, loggedInUser.id);
    return {
      title: `${user.displayName} (@${user.username})`,
    };
  } catch (error) {
    return { title: "Utilisateur non trouvé" };
  }
}

// --- PAGE PRINCIPALE ---
export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    redirect("/login"); // Plus propre qu'un simple message d'erreur
  }

  // Gestion du cas particulier "/users/me"
  if (username.toLowerCase() === "me") {
    redirect(`/users/${loggedInUser.username}`);
  }

  const user = await getUser(username, loggedInUser.id);
  const isUserProfile = user.id === loggedInUser.id;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-card border w-full justify-start rounded-2xl p-1 overflow-x-auto">
            <TabsTrigger value="posts" className="px-6">Annonces</TabsTrigger>
            {isUserProfile && (
              <>
                <TabsTrigger value="orders" className="px-6">Mes Achats</TabsTrigger>
                <TabsTrigger value="bookmarks" className="px-6">Mes Favoris</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="posts" className="space-y-5">
            <div className="rounded-2xl bg-card p-5 shadow-sm border mt-5">
              <h2 className="text-center text-xl font-bold">
                {isUserProfile ? "Mes annonces" : `Annonces de ${user.displayName}`}
              </h2>
            </div>
            <UserPosts userId={user.id} />
          </TabsContent>

          {/* SECTION DES ACHATS */}
          {isUserProfile && (
            <TabsContent value="orders" className="space-y-5">
              <div className="rounded-2xl bg-card p-5 shadow-sm border mt-5 text-center">
                <h2 className="text-xl font-bold uppercase italic tracking-tighter">
                  Suivi de mes commandes
                </h2>
              </div>
              <OrderConfirmationList userId={user.id} />
            </TabsContent>
          )}

          {/* SECTION DES FAVORIS */}
          {isUserProfile && (
            <TabsContent value="bookmarks" className="space-y-5">
               <div className="rounded-2xl bg-card p-5 shadow-sm border mt-5">
                <h2 className="text-center text-xl font-bold">Mes articles enregistrés</h2>
              </div>
              <BookmarksFeed />
            </TabsContent>
          )}
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}

// --- COMPOSANT D'EN-TÊTE DU PROFIL ---
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
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm border">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full border-4 border-background shadow-sm"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Membre depuis {formatDate(user.createdAt, "dd MMMM yyyy")}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>
              Annonces: <span className="font-semibold">{formatNumber(user._count.posts)}</span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words italic text-muted-foreground text-sm leading-relaxed">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}