"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { useSwipeable } from 'react-swipeable';

interface PostProps {
  post: PostData;
}

/**
 * Composant pour afficher le badge de certification du vendeur
 * La couleur change selon le nombre d'abonnés
 */
function SellerBadge({ followerCount, isSeller }: { followerCount: number; isSeller: boolean }) {
  if (!isSeller) return null;

  // Définition des paliers de couleurs
  let badgeColor = "text-slate-500"; // Gris (Standard < 100)
  let badgeTitle = "Vendeur Standard";

  if (followerCount >= 2000) {
    badgeColor = "text-yellow-400"; // Or (+2000)
    badgeTitle = "Vendeur Or";
  } else if (followerCount >= 500) {
    badgeColor = "text-slate-300"; // Argent (+500)
    badgeTitle = "Vendeur Argent";
  } else if (followerCount >= 100) {
    badgeColor = "text-amber-600"; // Bronze (+100)
    badgeTitle = "Vendeur Bronze";
  }

  return (
    <span title={badgeTitle} className="inline-flex items-center">
      <CheckCircle2 className={cn("size-4 fill-current", badgeColor)} />
    </span>
  );
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Seuil pour le bouton "Voir plus"
  const charLimit = 250;
  const isLongText = post.content.length > charLimit;

  return (
    <article className="group/post w-full space-y-3 bg-card p-4 md:p-5 shadow-none md:shadow-sm rounded-none md:rounded-2xl border-x-0 md:border border-y md:border-y-0 border-border transition-colors">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <div className="flex items-center gap-1.5">
              <UserTooltip user={post.user}>
                <Link
                  href={`/users/${post.user.username}`}
                  className="block font-medium hover:underline"
                >
                  {post.user.displayName}
                </Link>
              </UserTooltip>
              {/* Badge de certification dynamique selon followers */}
              <SellerBadge 
                isSeller={post.user.isSeller} 
                followerCount={post.user._count.followers} 
              />
            </div>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>

        {/* Bouton de menu visible par tous pour permettre le signalement */}
        <PostMoreButton
          post={post}
          className="opacity-100 md:opacity-0 transition-opacity group-hover/post:opacity-100"
        />
      </div>

      <Linkify>
        <div className="whitespace-pre-line break-words px-1 md:px-0">
          {isExpanded ? post.content : post.content.substring(0, charLimit)}
          
          {isLongText && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-primary font-semibold hover:underline"
            >
              {isExpanded ? "... Voir moins" : "... Voir plus"}
            </button>
          )}
        </div>
      </Linkify>

      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} postUserId={post.user.id} />
      )}

      <div className="flex justify-center mt-2 px-1 md:px-0">
        <button 
          onClick={() => redirectToChat(post.user.id)} 
          className="w-full text-center bg-primary/10 text-primary py-3 rounded-xl font-semibold cursor-pointer hover:bg-primary/20 transition-colors"
        >
          Discuter
        </button>
      </div>

      <hr className="text-muted-foreground/20 mx-1 md:mx-0" />
      
      <div className="flex justify-between gap-5 px-1 md:px-0">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user?.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user?.id
            ),
          }}
        />
      </div>

      {showComments && (
        <div className="pt-2">
           <Comments post={post} />
        </div>
      )}
    </article>
  );

  function redirectToChat(postUserId: string) {
    window.location.href = `/messages?userId=${postUserId}&postId=${post.id}`;
  }
}

interface MediaPreviewsProps {
  attachments: Media[];
  postUserId: string;
}

function MediaPreviews({ attachments, postUserId }: MediaPreviewsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalMedia = attachments.length;

  const handlers = useSwipeable({
    onSwipedLeft: () => setSelectedIndex((prev) => Math.min(prev + 1, totalMedia - 1)),
    onSwipedRight: () => setSelectedIndex((prev) => Math.max(prev - 1, 0)),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="relative -mx-4 md:mx-0 overflow-hidden bg-black/5" {...handlers}>
      <div 
        className="flex transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
      >
        {attachments.map((media) => (
          <div key={media.id} className="w-full flex-shrink-0 flex items-center justify-center bg-black/5">
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt="Attachment"
                width={800}
                height={800}
                className="w-full h-auto object-contain"
                loading="lazy"
                unoptimized
              />
            ) : media.type === "VIDEO" ? (
              <div className="w-full h-auto">
                <VideoPost src={media.url} className="w-full h-auto" />
              </div>
            ) : (
              <p className="p-4 text-destructive">Format non supporté</p>
            )}
          </div>
        ))}
      </div>

      {totalMedia > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
          {attachments.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                index === selectedIndex ? "bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentButton({ post, onClick }: { post: PostData; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments} <span className="hidden sm:inline">commentaires</span>
      </span>
    </button>
  );
}