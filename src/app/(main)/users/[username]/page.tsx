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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import BookmarksFeed from "@/app/(main)/bookmarks/Bookmarks";
import ZoomableImage from "@/components/ZoomableImage";
import { Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import ShareProfileButton from "./ShareProfileButton";
import MoreOptionsButton from "./MoreOptionsButton";
import UserProfileStickyHeader from "./UserProfileStickyHeader";
import {
  ProfileTabs, ProfileStats, OnlineBadge, MemberSince, DefaultBio,
} from "./UserProfileClient";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: getUserDataSelect(loggedInUserId),
  });
  if (!user) notFound();
  return user;
});

const getUserPublic = cache(async (username: string) => {
  return prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      isSeller: true,
      _count: { select: { posts: true, followers: true } },
      posts: { take: 3, orderBy: { createdAt: "desc" }, select: { content: true } },
    },
  });
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { username } = await props.params;
  const user = await getUserPublic(username);
  if (!user) return { title: "Profil introuvable — DealCity" };

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "https://dealcity.app";
  const productNames = user.posts
    .map((p) => { const m = p.content.match(/\s*PRODUIT\s*:\s*(.*)/i); return m ? m[1].trim() : null; })
    .filter(Boolean).slice(0, 3);

  const description = user.isSeller
    ? productNames.length > 0
      ? ` ${productNames.join(" · ")} — Boutique de ${user.displayName} sur DealCity Cameroun. ${user._count.posts} produits disponibles.`
      : `Boutique de ${user.displayName} sur DealCity — ${user._count.posts} produits disponibles. Commandez via WhatsApp !`
    : user.bio || `Profil de ${user.displayName} sur DealCity Cameroun.`;

  const ogImage = user.coverUrl || user.avatarUrl || `${origin}/icons/icon-512.png`;

  return {
    title: user.isSeller ? `${user.displayName} — Boutique DealCity` : `${user.displayName} — DealCity`,
    description,
    openGraph: {
      type: "profile",
      title: user.isSeller ? ` ${user.displayName} — Boutique sur DealCity` : `${user.displayName} sur DealCity`,
      description, url: `${origin}/users/${user.username}`, siteName: "DealCity", locale: "fr_CM",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Boutique de ${user.displayName} sur DealCity` }],
    },
    twitter: {
      card: "summary_large_image",
      title: user.isSeller ? ` ${user.displayName} — DealCity` : `${user.displayName} — DealCity`,
      description, images: [ogImage],
    },
    alternates: { canonical: `${origin}/users/${user.username}` },
    robots: { index: true, follow: true },
  };
}

export default async function Page(props: PageProps) {
  const { username } = await props.params;
  const { user: loggedInUser } = await validateRequest();

  if (username.toLowerCase() === "me") {
    if (!loggedInUser) redirect("/login");
    redirect(`/users/${loggedInUser.username}`);
  }

  const user = await getUser(username, loggedInUser?.id ?? "");
  const isUserProfile = loggedInUser ? user.id === loggedInUser.id : false;

  return (
    <main className="flex w-full min-w-0 gap-0 lg:gap-8 items-start">
      {/* ✅ Pas de space-y ici — le sticky header gère son propre espacement */}
      <div className="w-full min-w-0 flex-1">

        <UserProfile
          user={user as any}
          loggedInUserId={loggedInUser?.id ?? ""}
        />

        <div className="w-full mt-4 lg:mt-6">
          <Tabs defaultValue="posts" className="w-full">
            <ProfileTabs isUserProfile={isUserProfile} />
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
  const dateFormatted = formatDate(user.createdAt, "MMMM yyyy", { locale: fr });

  return (
    <>
      {/* ✅ Sticky header — s'affiche au scroll */}
      <UserProfileStickyHeader
        user={user}
        loggedInUserId={loggedInUserId}
        followerInfo={followerInfo}
        isAdmin={isAdmin}
      />

      {/* ✅ Carte profil — pas de margin-top, pas de gap avec sticky */}
      <div className="w-full top-[-3.5rem] bg-card text-foreground rounded-none sm:rounded-3xl overflow-hidden border border-border/60 shadow-sm relative">

        {/* ✅ Bannière — hauteur réduite pour éviter le décalage avatar */}
        <div className="h-32 sm:h-44 w-full relative overflow-hidden">
          {user.coverUrl ? (
            <ZoomableImage
              src={user.coverUrl}
              alt="Banniere de couverture"
              fill
              priority
              className="object-cover cursor-zoom-in"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f3a] via-[#1a3a6b] to-[#0d4a8a]">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
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
          <OnlineBadge />
        </div>

        {/* ✅ -mt-10 sm:-mt-12 — avatar sort moins de la bannière */}
        <div className="px-4 sm:px-6 pb-6 -mt-10 sm:-mt-12 relative z-10 space-y-4">

          {/* Avatar + boutons */}
          <div className="flex items-end justify-between gap-3">
            <div className="relative">
              <div className="p-[3px] rounded-full bg-gradient-to-br from-[#4a90e2] to-[#6ab344] shadow-lg shadow-[#4a90e2]/20">
                <div className="p-0.5 bg-card rounded-full">
                  <ZoomableImage
                    src={user.avatarUrl || "/icons/icon-192.png"}
                    alt="Avatar"
                    size={88}
                    className="size-[80px] sm:size-[88px] rounded-full object-cover cursor-zoom-in"
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
              {loggedInUserId && user.id === loggedInUserId ? (
                <EditProfileButton user={user} />
              ) : (
                loggedInUserId && (
                  <FollowButton userId={user.id} initialState={followerInfo} />
                )
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
              <div className="flex items-center gap-1">
                <Calendar className="size-3 opacity-60" />
                <MemberSince dateFormatted={dateFormatted} />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-background border border-[#4a90e2]/10 shadow-sm">
            <div className="shrink-0 px-2 py-0.5 bg-[#4a90e2]/10 border border-[#4a90e2]/20 rounded-lg text-[8px] font-black text-[#4a90e2] tracking-widest uppercase mt-0.5">
              Market
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed flex-1">
              {user.bio ? <Linkify>{user.bio}</Linkify> : <DefaultBio />}
            </p>
          </div>

          {/* Stats */}
          <ProfileStats
            postsCount={formatNumber(user._count.posts) as unknown as number}
            followersNode={<FollowerCount userId={user.id} initialState={followerInfo} />}
            salesCount={user.saleCount || 0}
          />
        </div>
      </div>
    </>
  );
}