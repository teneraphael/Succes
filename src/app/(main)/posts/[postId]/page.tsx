import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
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

export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  const post = await getPost(postId);

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "https://dealcity.app";

  // ✅ Regex robustes — sans emojis obligatoires
  const productMatch = post.content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = post.content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  const descMatch = post.content.match(
    /DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|📞|🔗|$)/i,
  );

  const productName = productMatch
    ? productMatch[1].trim()
    : post.user.displayName;
  const price = priceMatch
    ? `${priceMatch[1].trim().replace(/\s/g, "")} FCFA`
    : "";
  const shareTitle = price ? `${productName} — ${price}` : productName;
  const description = descMatch
    ? descMatch[1].trim().slice(0, 150)
    : post.content.slice(0, 150);

  const firstImage = post.attachments.find(
    (media) => media.type === "IMAGE",
  )?.url;
  const firstVideo = post.attachments.find((media) => media.type === "VIDEO");
  const ogImageRaw = firstVideo
    ? `/api/posts/${postId}/video-preview`
    : firstImage || post.user.avatarUrl || "/icons/icon-512.png";
  const ogImage = new URL(ogImageRaw, origin).toString();

  const isVideoOnly = !firstImage && !!firstVideo;
  const finalTitle = isVideoOnly ? `▶ ${shareTitle}` : shareTitle;

  return {
    title: finalTitle,
    description,
    alternates: { canonical: `${origin}/posts/${postId}` },
    openGraph: {
      title: finalTitle,
      description,
      url: `${origin}/posts/${postId}`,
      siteName: "DealCity",
      type: firstVideo ? "video.other" : "article",
      ...(firstVideo && {
        videos: [{ url: new URL(firstVideo.url, origin).toString() }],
      }),
      locale: "fr_CM",
      images: [
        {
          url: ogImage,
          ...(firstVideo && { width: 1200, height: 630, type: "image/jpeg" }),
          alt: firstVideo
            ? `Vidéo de ${productName} sur DealCity`
            : productName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();
  const post = await getPost(postId, user?.id ?? "");

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
      <div className="w-full min-w-0 space-y-5">
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
    <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg border border-[#4a90e2]/20 bg-[#4a90e2]/10">
          <UserAvatar avatarUrl={user.avatarUrl} size={28} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-foreground">
          A propos du vendeur
        </p>
      </div>

      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="group flex items-center gap-3"
        >
          <UserAvatar
            avatarUrl={user.avatarUrl}
            size={40}
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="line-clamp-1 break-all text-sm font-bold text-foreground transition-colors group-hover:text-[#4a90e2]">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>

      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-xs leading-relaxed text-muted-foreground">
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
