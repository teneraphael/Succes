"use client";

import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useMediaQuery } from "@/hooks/use-media-query"; // Importe ton hook ici

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)"); // Détection du mode PC

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
    });

  const allComments = data?.pages.flatMap((page) => page.comments) || [];
  const mainComments = allComments.filter(c => !c.content.startsWith("@"));
  const replyComments = allComments.filter(c => c.content.startsWith("@"));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 1. TITRE CONDITIONNEL : Masqué sur PC car le Sheet s'en occupe */}
      {!isDesktop && (
        <div className="border-b p-3 text-center text-sm font-bold sticky top-0 bg-background z-10">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted md:hidden" />
          Commentaires
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {hasNextPage && (
          <Button
            variant="ghost"
            className="mx-auto block text-xs text-muted-foreground"
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            {isFetching ? <Loader2 className="animate-spin size-4" /> : "Voir plus"}
          </Button>
        )}

        {status === "pending" && <Loader2 className="mx-auto animate-spin my-4" />}
        
        {status === "success" && !allComments.length && (
          <p className="text-center text-muted-foreground py-10 text-sm">
            Soyez le premier à commenter.
          </p>
        )}

        <div className="space-y-1">
          {mainComments.map((mainComment) => {
            const associatedReplies = replyComments.filter(r => 
              r.content.startsWith(`@${mainComment.user.username}`)
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

      <div className="sticky bottom-0 bg-background border-t">
        <CommentInput 
          post={post} 
          replyTarget={replyTarget} 
          onClearReply={() => setReplyTarget(null)} 
        />
      </div>
    </div>
  );
}