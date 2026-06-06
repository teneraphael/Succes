"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";
import Image from "next/image";

interface CommentProps {
  comment: CommentData;
  onReply: (username: string) => void;
  replies?: CommentData[];
}

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") ||
  url.includes("utfs.io") ||
  url.includes("lh3.googleusercontent.com");

export default function Comment({ comment, onReply, replies = [] }: CommentProps) {
  const { user } = useSession();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="group/comment flex flex-col gap-2 py-2">
      <div className="flex gap-2.5">

        {/* ✅ Avatar avec lien profil */}
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`} className="shrink-0">
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={34} />
          </Link>
        </UserTooltip>

        <div className="flex flex-col max-w-[85%]">
          <div className="flex items-start gap-2">

            {/* ✅ Bulle de commentaire — style DealCity */}
            <div className="rounded-2xl bg-muted/60 dark:bg-zinc-800/60 border border-border/40 px-4 py-2.5 space-y-1">

              {/* Nom utilisateur */}
              <UserTooltip user={comment.user}>
                <Link
                  href={`/users/${comment.user.username}`}
                  className="text-[11px] font-black text-[#4a90e2] hover:underline uppercase tracking-tight"
                >
                  {comment.user.displayName}
                </Link>
              </UserTooltip>

              {/* Contenu */}
              <p className="text-sm whitespace-pre-wrap break-words text-foreground leading-relaxed">
                {comment.content}
              </p>

              {/* ✅ Image preuve client */}
              {comment.mediaUrl && (
                <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-xl border border-border/40">
                  <Image
                    src={comment.mediaUrl}
                    alt="Preuve client"
                    fill
                    className="object-cover"
                    unoptimized={isExternalImage(comment.mediaUrl)}
                  />
                </div>
              )}
            </div>

            {/* ✅ Bouton options — visible au hover, uniquement pour l'auteur */}
            {comment.user.id === user?.id && (
              <CommentMoreButton
                comment={comment}
                className="opacity-0 transition-opacity group-hover/comment:opacity-100 mt-1"
              />
            )}
          </div>

          {/* ✅ Date + bouton répondre */}
          <div className="flex items-center gap-3 px-2 pt-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatRelativeDate(comment.createdAt)}
            </span>
            <button
              onClick={() => onReply(comment.user.username)}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#4a90e2] transition-colors"
            >
              Répondre
            </button>
          </div>

          {/* ✅ Bouton voir/masquer les réponses */}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mt-2 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#4a90e2] transition-colors"
            >
              <span className="h-px w-6 bg-muted-foreground/30" />
              {showReplies ? (
                <>
                  Masquer les réponses
                  <ChevronUp className="size-3" />
                </>
              ) : (
                <>
                  Voir les {replies.length} réponses
                  <ChevronDown className="size-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ✅ Réponses imbriquées — bordure bleue DealCity */}
      {showReplies && replies.length > 0 && (
        <div className="ml-10 mt-1 space-y-1 border-l-2 border-[#4a90e2]/20 ps-3">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}