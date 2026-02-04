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
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookmarksFeed from "@/app/(main)/bookmarks/Bookmarks"; 

interface PageProps {
  params: { username: string };
}

// --- AJOUT DE L'INTERFACE MANQUANTE ---
interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
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

export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};
  const user = await getUser(username, loggedInUser.id);
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        Vous n&apos;êtes pas autorisé à voir cette page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);
  const isUserProfile = user.id === loggedInUser.id;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-card border w-full justify-start rounded-2xl p-1">
            <TabsTrigger value="posts" className="px-6">Annonces</TabsTrigger>
            {isUserProfile && (
              <TabsTrigger value="bookmarks" className="px-6">Mes Favoris</TabsTrigger>
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
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Membre depuis {formatDate(user.createdAt, "MMM d, yyyy")}
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
            <div className="overflow-hidden whitespace-pre-line break-words italic text-muted-foreground text-sm">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}