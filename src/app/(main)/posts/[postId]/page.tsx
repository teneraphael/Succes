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

/**
 * On rend le loggedInUserId optionnel pour permettre aux robots 
 * de prévisualisation de récupérer les données publiques du post.
 */
const getPost = cache(async (postId: string, loggedInUserId?: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(loggedInUserId || ""),
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  // On ne vérifie PAS 'user' ici. On récupère le post en mode "public"
  const post = await getPost(postId);

  // On extrait la première image des attachments pour l'aperçu
  const firstImage = post.attachments.find((m) => m.type === "IMAGE")?.url;
  const description = post.content.slice(0, 160);

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
    description: description,
    openGraph: {
      title: `${post.user.displayName} sur TonApp`,
      description: description,
      type: "article",
      images: firstImage ? [
        {
          url: firstImage,
          width: 1200,
          height: 630,
          alt: "Aperçu du post",
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.user.displayName,
      description: description,
      images: firstImage ? [firstImage] : [],
    },
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();

  // Si tu veux que la page soit consultable sans être connecté, 
  // retire ce bloc. Sinon, garde-le pour forcer le login.
  if (!user) {
    return (
      <main className="mx-auto my-10 max-w-7xl px-3">
        <p className="text-center text-destructive font-bold">
          Veuillez vous connecter pour voir ce post.
        </p>
      </main>
    );
  }

  const post = await getPost(postId, user.id);

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