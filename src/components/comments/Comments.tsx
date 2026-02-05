"use client";

import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
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
    });

  const allComments = data?.pages.flatMap((page) => page.comments) || [];
  const mainComments = allComments.filter(c => !c.content.startsWith("@"));
  const replyComments = allComments.filter(c => c.content.startsWith("@"));

  return (
    /* h-full est crucial ici pour que le flex-col sache quelle hauteur diviser */
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-full bg-background overflow-hidden">
      
      {/* 1. TITRE FIXE */}
      {!isDesktop && (
        <div className="border-b p-3 text-center text-sm font-bold bg-background shrink-0">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted md:hidden" />
          Commentaires
        </div>
      )}

      {/* 2. ZONE DE SCROLL : flex-1 lui dit de prendre tout l'espace restant */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background">
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

      {/* 3. INPUT FIXE : sticky bottom-0 et shrink-0 pour ne jamais être écrasé */}
      <div className="shrink-0 sticky bottom-0 bg-background border-t z-20">
        <CommentInput 
          post={post} 
          replyTarget={replyTarget} 
          onClearReply={() => setReplyTarget(null)} 
        />
      </div>
    </div>
  );
}