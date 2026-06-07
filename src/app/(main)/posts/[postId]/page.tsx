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

export async function generateMetadata({ params: { postId } }: PageProps): Promise<Metadata> {
  const post = await getPost(postId);

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "https://dealcity.app";

  // ✅ Extraction infos produit
  const productMatch = post.content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = post.content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const productName = productMatch ? productMatch[1].trim() : post.user.displayName;
  const price = priceMatch ? `${priceMatch[1].trim()} FCFA` : "";
  const shareTitle = price ? `${productName} — ${price}` : productName;

  const description =
    post.content.split("📝 DESCRIPTION :")[1]?.trim().slice(0, 150) ||
    post.content.slice(0, 150);

  // ✅ Priorité og:image :
  // 1. Première image du post
  // 2. Thumbnail de la vidéo (si thumbnailUrl existe dans le modèle)
  // 3. Avatar du vendeur
  // 4. Logo DealCity par défaut
  const firstImage = post.attachments.find((m) => m.type === "IMAGE")?.url;
  const firstVideo = post.attachments.find((m) => m.type === "VIDEO");
  const videoThumbnail = (firstVideo as any)?.thumbnailUrl || null;

  const ogImage =
    firstImage ||
    videoThumbnail ||
    post.user.avatarUrl ||
    `${origin}/icons/icon-512.png`;

  // ✅ Badge vidéo dans le titre si post vidéo uniquement
  const isVideoOnly = !firstImage && !!firstVideo;
  const finalTitle = isVideoOnly ? `▶ ${shareTitle}` : shareTitle;

  return {
    title: finalTitle,
    description,

    // ✅ Open Graph — Facebook, WhatsApp, LinkedIn
    openGraph: {
      title: finalTitle,
      description,
      url: `${origin}/posts/${postId}`,
      siteName: "DealCity",
      type: "article",
      locale: "fr_CM",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
    },

    // ✅ Twitter Card — TikTok bio link
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
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm border border-border/60">
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
          <UserAvatar avatarUrl={user.avatarUrl} size={28} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-foreground">
          A propos du vendeur
        </p>
      </div>

      <UserTooltip user={user}>
        <Link href={`/users/${user.username}`} className="flex items-center gap-3 group">
          <UserAvatar avatarUrl={user.avatarUrl} size={40} className="shrink-0" />
          <div className="min-w-0">
            <p className="line-clamp-1 break-all text-sm font-bold text-foreground group-hover:text-[#4a90e2] transition-colors">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>

      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-xs text-muted-foreground leading-relaxed">
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