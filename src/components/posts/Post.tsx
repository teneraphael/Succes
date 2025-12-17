"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost"; // Assurez-vous que ce composant est bien défini.
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

      <div className="flex justify-center mt-2">
        <button onClick={() => redirectToChat(post.user.id)} className="w-full text-center bg-black/30 text-white py-3 font-semibold cursor-pointer hover:bg-black/50 transition">
          Discuter
        </button>
      </div>

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
    trackMouse: true,
  });

  return (
    <div className="relative overflow-hidden" {...handlers}>
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${selectedIndex * 100}%)` }}>
        {attachments.map((media) => (
          <div key={media.id} className="w-full flex-shrink-0">
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt={`Image attachment ${media.id}`}
                width={500}
                height={500}
                className="object-cover mx-auto"
                loading="lazy"
              />
            ) : media.type === "VIDEO" ? (
              <VideoPost src={media.url} className="mx-auto" />
            ) : (
              <p className="text-destructive">Unsupported media type</p>
            )}
          </div>
        ))}
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