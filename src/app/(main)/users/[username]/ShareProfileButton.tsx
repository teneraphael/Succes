"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareProfileButtonProps {
  username: string;
}

export default function ShareProfileButton({ username }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const profileUrl = `${window.location.origin}/users/${username}`;

    // Utilisation de l'API de partage native si disponible sur mobile (WhatsApp, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil de @${username} — DealCity`,
          url: profileUrl,
        });
        return;
      } catch (err) {
        console.log("Partage natif annulé ou échoué", err);
      }
    }

    // Fallback standard : Copie dans le presse-papiers
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Impossible de copier le lien", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all hidden sm:flex items-center justify-center shadow-sm"
      title="Copier le lien du profil"
    >
      {copied ? (
        <Check className="size-4 text-emerald-600 animate-in fade-in zoom-in-75 duration-150" />
      ) : (
        <Share2 className="size-4" />
      )}
    </button>
  );
}