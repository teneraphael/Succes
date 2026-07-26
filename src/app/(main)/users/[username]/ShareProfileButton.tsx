"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ShareProfileButtonProps {
  username: string;
}

export default function ShareProfileButton({ username }: ShareProfileButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getProfileUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://dealcity.app/users/${username}`;
  };

  const handleShare = async () => {
    const url = getProfileUrl();
    const shareData = {
      title: `Profil de @${username} sur DealCity`,
      text: `Découvrez la boutique de @${username} sur DealCity !`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Annulé par l'utilisateur
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      toast({ description: "Lien du profil copié ! 📋" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", description: "Impossible de copier le lien." });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full size-10 border-border/60 hover:bg-muted transition-all active:scale-95"
          title="Partager le profil"
        >
          <Share2 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-border/60">
        <DropdownMenuItem
          onClick={handleShare}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold"
        >
          <Share2 className="size-4 text-primary" />
          <span>Partager le profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopy}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold"
        >
          {copied ? (
            <>
              <Check className="size-4 text-emerald-500" />
              <span className="text-emerald-500">Lien copié !</span>
            </>
          ) : (
            <>
              <Copy className="size-4 text-muted-foreground" />
              <span>Copier le lien</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}