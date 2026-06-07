"use client";

import { PostData } from "@/lib/types";
import { Loader2, SendHorizonal, X, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "./mutations";
import Image from "next/image";
import { useSession } from "@/app/(main)/SessionProvider";
import { useLanguage } from "@/components/LanguageProvider";

interface CommentInputProps {
  post: PostData;
  replyTarget?: string | null;
  onClearReply?: () => void;
}

export default function CommentInput({ post, replyTarget, onClearReply }: CommentInputProps) {
  const { user } = useSession();
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useSubmitCommentMutation(post.id);

  // ✅ Focus automatique + pré-remplissage de la mention lors d'une réponse
  useEffect(() => {
    if (replyTarget) {
      if (!input.startsWith(`@${replyTarget}`)) {
        setInput(`@${replyTarget} `);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyTarget]);

  // ✅ Nettoyage URL prévisualisation — évite les fuites mémoire
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmedInput = input.trim();
    if ((!trimmedInput && !selectedImage) || mutation.isPending) return;

    mutation.mutate(
      { post, content: trimmedInput, media: selectedImage },
      {
        onSuccess: () => {
          setInput("");
          removeImage();
          if (onClearReply) onClearReply();

          // ✅ Tracking algo — enregistre l'interaction commentaire
          fetch("/api/posts/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: post.id, type: "COMMENT", itemType: "POST" }),
          }).catch((err) => console.error("Algo tracking error:", err));
        },
      },
    );
  }

  if (!user) return null;

  return (
    <div className="border-t border-border/40 bg-card px-3 py-3">

      {/* Aperçu image */}
      {previewUrl && (
        <div className="relative mb-3 inline-block">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -right-1.5 -top-1.5 size-5 flex items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* ✅ Bandeau réponse traduit */}
      {replyTarget && (
        <div className="flex items-center justify-between px-3 pb-2 animate-in fade-in slide-in-from-bottom-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {t.reply_to}{" "}
            <span className="text-[#4a90e2] font-black">@{replyTarget}</span>
          </p>
          <button
            type="button"
            onClick={onClearReply}
            className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <form className="mx-auto flex max-w-4xl items-center gap-2" onSubmit={onSubmit}>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        {/* Bouton caméra */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all shrink-0 active:scale-90"
        >
          <Camera className="size-5" />
        </button>

        {/* ✅ Champ de saisie traduit */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={t.write_comment}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            className="rounded-2xl border border-[#4a90e2]/10 bg-[#f8faff] dark:bg-zinc-800/50 px-4 py-2 focus-visible:border-[#4a90e2]/30 focus-visible:ring-1 focus-visible:ring-[#4a90e2]/10 text-sm font-medium transition-all"
          />
        </div>

        {/* Bouton envoyer */}
        <button
          type="submit"
          disabled={(!input.trim() && !selectedImage) || mutation.isPending}
          className="p-2 rounded-xl text-[#4a90e2] hover:bg-[#4a90e2]/10 transition-all active:scale-90 disabled:text-muted-foreground disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            <SendHorizonal className="size-5" />
          )}
        </button>
      </form>
    </div>
  );
}