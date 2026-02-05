"use client";

import { PostData } from "@/lib/types";
import { Loader2, SendHorizonal, X, Camera } from "lucide-react"; // Ajout de Camera
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "./mutations";
import Image from "next/image";

interface CommentInputProps {
  post: PostData;
  replyTarget?: string | null;
  onClearReply?: () => void;
}

export default function CommentInput({ post, replyTarget, onClearReply }: CommentInputProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useSubmitCommentMutation(post.id);

  useEffect(() => {
    if (replyTarget) {
      if (!input.startsWith(`@${replyTarget}`)) {
        setInput(`@${replyTarget} `);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [replyTarget, input]);

  // Gérer la sélection de l'image
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  // Annuler l'image choisie
  function removeImage() {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    // On autorise l'envoi si il y a du texte OU une image
    if ((!trimmedInput && !selectedImage) || mutation.isPending) return;

    mutation.mutate(
      {
        post,
        content: trimmedInput,
        media: selectedImage, // On passe l'image à la mutation
      },
      {
        onSuccess: () => {
          setInput("");
          removeImage();
          if (onClearReply) onClearReply();
          
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
      {/* Aperçu de l'image avant envoi */}
      {previewUrl && (
        <div className="relative mb-3 inline-block">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border shadow-sm">
            <Image 
              src={previewUrl} 
              alt="Preview" 
              fill 
              className="object-cover" 
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {replyTarget && (
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1">
          <p>En réponse à <span className="font-bold text-primary">@{replyTarget}</span></p>
          <button type="button" onClick={onClearReply} className="hover:text-destructive transition-colors">
            <X className="size-3" />
          </button>
        </div>
      )}

      <form className="mx-auto flex max-w-4xl items-center gap-2" onSubmit={onSubmit}>
        {/* Input de fichier caché */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        
        {/* Bouton pour ouvrir l'appareil photo/galerie */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="size-5" />
        </Button>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="Écrire un commentaire..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            className="rounded-full border-none bg-muted px-4 py-2 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-transparent disabled:text-muted-foreground transition-transform active:scale-90"
          disabled={(!input.trim() && !selectedImage) || mutation.isPending}
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