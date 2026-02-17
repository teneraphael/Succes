"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { 
  MoreHorizontal, 
  Trash2, 
  ShieldAlert, 
  Download, 
  Copy, 
  Share2,
  ExternalLink,
  Loader2,
  Store,
  MessageCircle,
  Instagram,
  Music2
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import DeletePostDialog from "./DeletePostDialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({
  post,
  className,
}: PostMoreButtonProps) {
  const { user: currentUser } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReporting, setIsReporting] = useState(false); 

  if (!currentUser) return null;

  // --- LOGIQUE DE RÉCUPÉRATION DU LIEN ---
  // On définit une priorité : TikTok > Instagram > WhatsApp
  const socialLink = post.user.tiktokUrl || post.user.instagramUrl || post.user.whatsappUrl;

  // --- LOGIQUE DE DÉTECTION AMÉLIORÉE ---
  const getSocialInfo = (url: string) => {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes("tiktok.com")) {
      return { 
        label: "Voir sur TikTok", 
        icon: <Music2 className="mr-2 size-4 text-[#ff0050]" />, 
        color: "text-[#ff0050] dark:text-[#ff3b5c]" 
      };
    }
    if (lowerUrl.includes("instagram.com")) {
      return { 
        label: "Voir sur Instagram", 
        icon: <Instagram className="mr-2 size-4 text-[#e1306c]" />, 
        color: "text-[#e1306c] dark:text-[#ff4b8b]" 
      };
    }
    if (lowerUrl.includes("wa.me") || lowerUrl.includes("whatsapp.com")) {
      return { 
        label: "Contact WhatsApp", 
        icon: <MessageCircle className="mr-2 size-4 text-[#25d366]" />, 
        color: "text-[#25d366] dark:text-[#4ade80]" 
      };
    }
    return { 
      label: "Voir la boutique", 
      icon: <Store className="mr-2 size-4 text-[#4a90e2]" />, 
      color: "text-[#4a90e2]" 
    };
  };

  const socialInfo = socialLink ? getSocialInfo(socialLink) : null;

  // --- ACTIONS ---
  async function copyLink() {
    const url = `${window.location.origin}/posts/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({ description: "Lien de l'annonce copié !" });
  }

  async function handleShare() {
    const shareData = {
      title: `DealCity - ${post.user.displayName}`,
      text: post.content,
      url: `${window.location.origin}/posts/${post.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error(err);
      }
    } else {
      copyLink();
    }
  }

  async function downloadMedia() {
    if (post.attachments.length === 0) return;
    toast({ description: "Téléchargement lancé..." });

    for (const [index, media] of post.attachments.entries()) {
      try {
        const response = await fetch(media.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dealcity_${post.user.username}_${index + 1}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast({ variant: "destructive", description: "Erreur média." });
      }
    }
  }

  async function handleReport() {
    if (isReporting) return;
    setIsReporting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/report`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur signalement");
      toast({ 
        description: data.message, 
        variant: data.message.includes("supprimé") ? "destructive" : "default" 
      });
      if (data.message.includes("supprimé")) router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message });
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 shadow-2xl border-border/50 rounded-2xl bg-card">
          
          {/* LIEN SOCIAL DYNAMIQUE */}
          {socialLink && socialInfo && (
            <>
              <DropdownMenuItem asChild>
                <a 
                  href={socialLink.startsWith('http') ? socialLink : `https://${socialLink}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center ${socialInfo.color} font-black italic cursor-pointer focus:bg-muted transition-all active:scale-95`}
                >
                  {socialInfo.icon}
                  {socialInfo.label}
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
            </>
          )}

          <DropdownMenuItem onClick={handleShare} className="cursor-pointer font-medium rounded-lg">
            <Share2 className="mr-2 size-4 text-muted-foreground" />
            Partager l&apos;annonce
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copyLink} className="cursor-pointer font-medium rounded-lg">
            <Copy className="mr-2 size-4 text-muted-foreground" />
            Copier le lien
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer font-medium rounded-lg">
            <a href={`/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4 text-muted-foreground" />
              Mode plein écran
            </a>
          </DropdownMenuItem>

          {post.attachments.length > 0 && (
            <DropdownMenuItem onClick={downloadMedia} className="cursor-pointer font-medium text-blue-600 focus:text-blue-500 rounded-lg">
              <Download className="mr-2 size-4" />
              Télécharger les images
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-2" />

          {/* ACTIONS DE MODÉRATION / PROPRIÉTAIRE */}
          {post.user.id === currentUser.id ? (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold rounded-lg"
            >
              <Trash2 className="mr-2 size-4" />
              Supprimer mon annonce
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleReport} 
              disabled={isReporting}
              className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-900/10 font-bold cursor-pointer rounded-lg"
            >
              {isReporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShieldAlert className="mr-2 size-4" />
              )}
              {isReporting ? "Vérification..." : "Signaler ce contenu"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePostDialog
        post={post}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}