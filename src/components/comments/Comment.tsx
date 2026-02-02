"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react"; // Pour l'icône ouvrir/fermer
import Link from "next/link";
import { useState } from "react";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
  onReply: (username: string) => void;
  replies?: CommentData[]; // Nouvelle prop pour passer les réponses
}

export default function Comment({ comment, onReply, replies = [] }: CommentProps) {
  const { user } = useSession();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="group/comment flex flex-col gap-2 py-2">
      <div className="flex gap-2">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={36} />
          </Link>
        </UserTooltip>

        <div className="flex flex-col max-w-[85%]">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-muted px-4 py-2">
              <UserTooltip user={comment.user}>
                <Link
                  href={`/users/${comment.user.username}`}
                  className="block text-xs font-bold hover:underline"
                >
                  {comment.user.displayName}
                </Link>
              </UserTooltip>
              <div className="text-sm whitespace-pre-wrap break-words text-foreground">
                {comment.content}
              </div>
            </div>

            {comment.user.id === user.id && (
              <CommentMoreButton
                comment={comment}
                className="opacity-0 transition-opacity group-hover/comment:opacity-100"
              />
            )}
          </div>

          <div className="flex items-center gap-3 ps-2 pt-1">
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(comment.createdAt)}
            </span>
            <button
              onClick={() => onReply(comment.user.username)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Répondre
            </button>
          </div>

          {/* BOUTON "VOIR LES RÉPONSES" */}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mt-2 flex items-center gap-2 ps-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <span className="h-[1px] w-6 bg-muted-foreground/30" />
              {showReplies ? (
                <>
                  Masquer les réponses <ChevronUp className="size-3" />
                </>
              ) : (
                <>
                  Voir les {replies.length} réponses <ChevronDown className="size-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ZONE DES RÉPONSES (DÉCALÉE) */}
      {showReplies && replies.length > 0 && (
        <div className="ml-10 mt-1 space-y-1 border-l-2 border-muted ps-2">
          {replies.map((reply) => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              onReply={onReply} 
              // Si tu as plusieurs niveaux, tu peux passer replies={reply.replies} ici
            />
          ))}
        </div>
      )}
    </div>
  );
}