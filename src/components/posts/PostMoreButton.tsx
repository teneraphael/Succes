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
  Store
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
  const { user } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReporting, setIsReporting] = useState(false); 

  if (!user) return null;

  // --- ACTIONS ---

  async function copyLink() {
    const url = `${window.location.origin}/posts/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({ description: "Lien copié dans le presse-papier." });
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
    toast({ description: "Préparation du téléchargement..." });

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
        console.error(error);
        toast({ variant: "destructive", description: "Erreur lors du téléchargement." });
      }
    }
  }

  // --- LOGIQUE DE SIGNALEMENT ---
  async function handleReport() {
    if (isReporting) return;
    setIsReporting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}/report`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du signalement");
      }

      toast({ 
        description: data.message, 
        variant: data.message.includes("supprimé") ? "destructive" : "default" 
      });

      if (data.message.includes("supprimé")) {
        router.refresh(); 
      }

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        description: error.message 
      });
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
        <DropdownMenuContent align="end" className="w-60 shadow-xl border-border/50">
          
          {/* LIEN SOCIAL DU VENDEUR (TIKTOK / INSTA) */}
          {post.user.socialLink && (
            <>
              <DropdownMenuItem asChild>
                <a 
                  href={post.user.socialLink.startsWith('http') ? post.user.socialLink : `https://${post.user.socialLink}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[#4a90e2] font-bold cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-[#4a90e2]"
                >
                  <Store className="mr-2 size-4 text-[#4a90e2]" />
                  Voir la boutique TikTok/Insta
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
            <Share2 className="mr-2 size-4" />
            Partager l&apos;annonce
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
            <Copy className="mr-2 size-4" />
            Copier le lien
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer">
            <a href={`/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Ouvrir dans un onglet
            </a>
          </DropdownMenuItem>

          {post.attachments.length > 0 && (
            <DropdownMenuItem onClick={downloadMedia} className="cursor-pointer">
              <Download className="mr-2 size-4" />
              Enregistrer les médias
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* ACTIONS DE MODÉRATION / PROPRIÉTAIRE */}
          {post.user.id === user.id ? (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
            >
              <Trash2 className="mr-2 size-4" />
              Supprimer mon annonce
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleReport} 
              disabled={isReporting}
              className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-900/10 font-medium cursor-pointer"
            >
              {isReporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShieldAlert className="mr-2 size-4" />
              )}
              {isReporting ? "Vérification..." : "Signaler le contenu"}
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