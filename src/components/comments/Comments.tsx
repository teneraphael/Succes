"use client";

import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "@/app/(main)/SessionProvider";
import Link from "next/link";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { user } = useSession();
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // LOGIQUE FORFAIT : On vérifie si le vendeur peut recevoir des commentaires
  // Un vendeur est "bloqué" s'il est vendeur ET que son solde est < 25 FCFA
  const isSellerBlocked = post.user.isSeller && (post.user.balance ?? 0) < 25;
  const isOwner = user?.id === post.user.id;

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
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-full bg-background overflow-hidden">
      
      {!isDesktop && (
        <div className="border-b p-3 text-center text-sm font-bold bg-background shrink-0">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted md:hidden" />
          Commentaires
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background">
        {/* Banner Alerte si forfait épuisé (visible par tous) */}
        {isSellerBlocked && !isOwner && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4" />
            Le forfait de ce vendeur est épuisé. Les commentaires sont temporairement désactivés.
          </div>
        )}

        {isSellerBlocked && isOwner && (
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-orange-500 bg-orange-500/10 p-3 text-xs text-orange-600">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="size-4" />
              Votre forfait DealCity est épuisé !
            </div>
            <p>Rechargez votre compte pour continuer à recevoir des commentaires et des messages clients.</p>
            <Button size="sm" className="h-7 w-fit bg-orange-500 text-white text-[10px]">
              Recharger maintenant
            </Button>
          </div>
        )}

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

      <div className="shrink-0 sticky bottom-0 bg-background border-t z-20">
        {user ? (
          // On désactive l'input si le vendeur est bloqué (sauf si c'est le vendeur lui-même qui veut répondre)
          isSellerBlocked && !isOwner ? (
            <div className="p-4 bg-muted/50 text-center text-xs text-muted-foreground italic">
              Commentaires désactivés (forfait vendeur épuisé)
            </div>
          ) : (
            <CommentInput 
              post={post} 
              replyTarget={replyTarget} 
              onClearReply={() => setReplyTarget(null)} 
            />
          )
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Veuillez vous{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                connecter
              </Link>{" "}
              pour participer à la discussion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}