"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare } from "lucide-react";
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

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>

      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>

      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} postUserId={post.user.id} />
      )}

      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
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
              (bookmark) => bookmark.userId === user.id
            ),
          }}
        />
      </div>

      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
  postUserId: string;
}

function MediaPreviews({ attachments, postUserId }: MediaPreviewsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative">
      <div className="flex overflow-hidden">
        {attachments.map((media, index) => (
          <div
            key={media.id}
            className={`transition-transform duration-500 ease-in-out ${index === selectedIndex ? 'block' : 'hidden'}`}
          >
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt={`Image attachment ${media.id}`}
                width={500} // Ajustez selon vos besoins
                height={500} // Ajustez selon vos besoins
                className="object-cover mx-auto" // Style pour un bon rendu
                loading="lazy"
              />
            ) : media.type === "VIDEO" ? (
              <VideoPost src={media.url} />
            ) : (
              <p className="text-destructive">Unsupported media type</p>
            )}
          </div>
        ))}
      </div>

      {/* Contrôles pour naviguer entre les images */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 cursor-pointer" onClick={handlePrev}>
        &#10094; {/* Flèche gauche */}
      </div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 cursor-pointer" onClick={handleNext}>
        &#10095; {/* Flèche droite */}
      </div>

      {/* Indicateurs de pagination */}
      <div className="flex justify-center mt-2">
        {attachments.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full mx-1 cursor-pointer ${index === selectedIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments} <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}