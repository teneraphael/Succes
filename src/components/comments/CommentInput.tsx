"use client";

import { PostData } from "@/lib/types";
import { Loader2, SendHorizonal, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "./mutations";

interface CommentInputProps {
  post: PostData;
  replyTarget?: string | null;
  onClearReply?: () => void;
}

export default function CommentInput({ post, replyTarget, onClearReply }: CommentInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useSubmitCommentMutation(post.id);

  // Gère l'apparition d'une réponse
  useEffect(() => {
    if (replyTarget) {
      // On s'assure qu'il n'y a pas déjà la mention pour éviter les doublons
      if (!input.startsWith(`@${replyTarget}`)) {
        setInput(`@${replyTarget} `);
      }
      // Focus optimisé pour l'accessibilité
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [replyTarget, input]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || mutation.isPending) return;

    mutation.mutate(
      {
        post,
        content: trimmedInput,
      },
      {
        onSuccess: () => {
          setInput("");
          if (onClearReply) onClearReply();
          
          // Tracking algorithmique
          fetch("/api/posts/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: post.id,
              type: "COMMENT",
              itemType: "POST",
            }),
          }).catch((err) => console.error("Algo tracking error:", err));
        },
      },
    );
  }

  return (
    <div className="border-t bg-card p-3 shadow-sm">
      {/* Indicateur de réponse */}
      {replyTarget && (
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1">
          <p>
            En réponse à <span className="font-bold text-primary">@{replyTarget}</span>
          </p>
          <button 
            type="button"
            onClick={onClearReply} 
            className="hover:text-destructive transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <form className="mx-auto flex max-w-4xl items-center gap-2" onSubmit={onSubmit}>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="Écrire un commentaire..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // Désactive l'autofill pour éviter les suggestions gênantes sur mobile
            autoComplete="off"
            className="rounded-full border-none bg-muted px-4 py-2 pr-10 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-transparent disabled:text-muted-foreground transition-transform active:scale-90"
          disabled={!input.trim() || mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            <SendHorizonal className="size-5" />
          )}
        </Button>
      </form>
    </div>
  );
}