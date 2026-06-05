import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { Loader2, ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";


interface PageProps {
  params: { postId: string };
}

const getPost = cache(async (postId: string, loggedInUserId?: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(loggedInUserId || ""),
  });
  if (!post) notFound();
  return post;
});

// Récupérer les posts du même vendeur pour la navigation
const getSellerPosts = cache(async (userId: string, currentPostId: string) => {
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
    take: 50,
  });
  return posts.map((p) => p.id);
});

export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  const post = await getPost(postId);

  const firstImage = post.attachments.find((m) => m.type === "IMAGE")?.url;
  const productMatch = post.content.match(/🛍️ PRODUIT : (.*)/);
  const priceMatch = post.content.match(/💰 PRIX : (.*?) FCFA/);
  const productName = productMatch ? productMatch[1] : post.user.displayName;
  const price = priceMatch ? `${priceMatch[1]} FCFA` : "";
  const shareTitle = `${productName} - ${price}`.trim();
  const description =
    post.content.split("📝 DESCRIPTION :")[1]?.trim().slice(0, 150) ||
    post.content.slice(0, 150);
  const ogImage = firstImage ?? null;

  return {
    title: shareTitle,
    description,
    openGraph: {
      title: shareTitle,
      description,
      url: `https://dealcity.app/posts/${postId}`,
      siteName: "DealCity",
      type: "article",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, type: "image/jpeg" }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();
  const post = await getPost(postId, user?.id ?? "");

  // ✅ Récupérer tous les posts du vendeur pour la navigation
  const sellerPostIds = await getSellerPosts(post.userId, postId);
  const currentIndex = sellerPostIds.indexOf(postId);
  const prevPostId = currentIndex > 0 ? sellerPostIds[currentIndex - 1] : null;
  const nextPostId = currentIndex < sellerPostIds.length - 1 ? sellerPostIds[currentIndex + 1] : null;

  if (!user) {
    return (
      <main className="flex w-full min-w-0 gap-5">
        <div className="w-full min-w-0 space-y-5">
          <Post post={post} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-3">

        {/* ✅ Barre de navigation entre posts du vendeur */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={`/users/${post.user.username}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <UserAvatar avatarUrl={post.user.avatarUrl} size={28} />
            <span className="font-bold group-hover:underline">
              {post.user.displayName}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Retour au profil */}
            <Link
              href={`/users/${post.user.username}`}
              className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
              title="Voir le catalogue"
            >
              <Grid2X2 className="size-4 text-muted-foreground" />
            </Link>

            {/* Post précédent */}
            {prevPostId ? (
              <Link
                href={`/posts/${prevPostId}`}
                className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
                title="Produit précédent"
              >
                <ChevronLeft className="size-4 text-muted-foreground" />
              </Link>
            ) : (
              <div className="p-2 rounded-xl bg-card border border-border/40 opacity-30">
                <ChevronLeft className="size-4 text-muted-foreground" />
              </div>
            )}

            {/* Compteur */}
            <span className="text-[10px] font-black text-muted-foreground min-w-[40px] text-center">
              {currentIndex + 1} / {sellerPostIds.length}
            </span>

            {/* Post suivant */}
            {nextPostId ? (
              <Link
                href={`/posts/${nextPostId}`}
                className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
                title="Produit suivant"
              >
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ) : (
              <div className="p-2 rounded-xl bg-card border border-border/40 opacity-30">
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <Post post={post} />
      </div>

      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm border">
      <div className="text-xl font-bold">À propos du vendeur</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground text-sm">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground text-sm">
          {user.bio}
        </div>
      </Linkify>
      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.id,
            ),
          }}
        />
      )}
    </div>
  );
}