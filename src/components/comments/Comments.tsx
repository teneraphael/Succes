"use client";

import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "@/app/(main)/SessionProvider";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { user } = useSession();
  const { t } = useLanguage();
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
      // ✅ 3 tentatives + cache 5 min pour la résilience réseau
      retry: 3,
      staleTime: 1000 * 60 * 5,
    });

  const allComments = data?.pages.flatMap((page) => page.comments) || [];
  const mainComments = allComments.filter((c) => !c.content.startsWith("@"));
  const replyComments = allComments.filter((c) => c.content.startsWith("@"));

  return (
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-full bg-background overflow-hidden">

      {/* ✅ Header mobile traduit */}
      {!isDesktop && (
        <div className="border-b border-border/40 px-4 py-3 text-center shrink-0 bg-background">
          <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-muted" />
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="size-4 text-[#4a90e2]" />
            <span className="text-sm font-black uppercase tracking-tight text-foreground">
              {t.comments}
            </span>
          </div>
        </div>
      )}

      {/* Zone scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-background">

        {/* ✅ Bouton charger plus traduit */}
        {hasNextPage && (
          <button
            disabled={isFetching}
            onClick={() => fetchNextPage()}
            className="mx-auto flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all disabled:opacity-50 mb-2"
          >
            {isFetching ? (
              <Loader2 className="animate-spin size-3.5" />
            ) : (
              t.load_more
            )}
          </button>
        )}

        {/* Skeleton chargement */}
        {status === "pending" && (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2.5 animate-pulse">
                <div className="size-9 rounded-full bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-16 bg-muted rounded-2xl w-full" />
                  <div className="h-2 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ État vide traduit */}
        {status === "success" && !allComments.length && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="size-12 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
              <MessageCircle className="size-5 text-[#4a90e2]" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t.first_comment}
            </p>
          </div>
        )}

        {/* Liste commentaires */}
        <div className="space-y-1">
          {mainComments.map((mainComment) => {
            const associatedReplies = replyComments.filter((r) =>
              r.content.startsWith(`@${mainComment.user.username}`),
            );
            return (
              <Comment
                key={mainComment.id}
                comment={mainComment}
                onReply={(username) => setReplyTarget(username)}
                replies={associatedReplies}
              />
            );
          })}
        </div>
      </div>

      {/* Zone saisie sticky */}
      <div className="shrink-0 sticky bottom-0 bg-background z-20">
        {user ? (
          <CommentInput
            post={post}
            replyTarget={replyTarget}
            onClearReply={() => setReplyTarget(null)}
          />
        ) : (
          // ✅ Invite connexion traduite
          <div className="px-4 py-3 border-t border-border/40 bg-[#4a90e2]/5 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              {t.login_to_comment.split("Sign in").join("")}
              <Link
                href="/login"
                className="text-[#4a90e2] font-black hover:underline uppercase tracking-tight italic mx-1"
              >
                {t.login}
              </Link>
              {t.login_to_comment.includes("to join") ? "to join the discussion." : "pour participer à la discussion."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}