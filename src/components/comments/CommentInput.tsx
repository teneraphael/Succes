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
      setInput(`@${replyTarget} `);
      // On attend un petit peu que le drawer soit bien stable pour le focus
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [replyTarget]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => {
          setInput("");
          if (onClearReply) onClearReply(); // On vide la cible de réponse après envoi
          fetch("/api/posts/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: post.id,
              type: "COMMENT",
              itemType: "POST",
            }),
          }).catch((err) => console.error("Algo tracking error (comment):", err));
        },
      },
    );
  }

  return (
    <div className="border-t bg-card p-3 shadow-sm">
      {/* Petit indicateur au-dessus de l'input si on répond à quelqu'un */}
      {replyTarget && (
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground">
          <span>En réponse à <span className="font-bold text-primary">@{replyTarget}</span></span>
          <button onClick={onClearReply} className="hover:text-foreground">
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
            className="rounded-full border-none bg-muted px-4 py-2 pr-10 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-transparent disabled:text-muted-foreground"
          disabled={!input.trim() || mutation.isPending}
        >
          {!mutation.isPending ? (
            <SendHorizonal className="size-5" />
          ) : (
            <Loader2 className="animate-spin size-5" />
          )}
        </Button>
      </form>
    </div>
  );
}