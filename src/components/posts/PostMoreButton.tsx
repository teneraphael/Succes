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
  ExternalLink 
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!user) return null;

  // --- ACTIONS ---

  // 1. Copier le lien
  async function copyLink() {
    const url = `${window.location.origin}/posts/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({ description: "Lien copié dans le presse-papier." });
  }

  // 2. Partager (Menu natif mobile ou copie lien)
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

  // 3. Télécharger les médias
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

  // 4. Signaler
  async function handleReport() {
    try {
      const response = await fetch(`/api/posts/${post.id}/report`, { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du signalement");
      }
      toast({ description: "Merci ! Ce contenu a été signalé." });
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message || "Déjà signalé." });
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
        <DropdownMenuContent align="end" className="w-56">
          
          {/* OPTIONS DE PARTAGE & ACCÈS */}
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 size-4" />
            {"Partager l'annonce"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copyLink}>
            <Copy className="mr-2 size-4" />
            Copier le lien
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href={`/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Ouvrir dans un onglet
            </a>
          </DropdownMenuItem>

          {/* OPTION TÉLÉCHARGEMENT */}
          {post.attachments.length > 0 && (
            <DropdownMenuItem onClick={downloadMedia}>
              <Download className="mr-2 size-4" />
              Enregistrer les médias
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* ACTIONS SENSIBLES */}
          {post.user.id === user.id ? (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Supprimer mon annonce
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleReport} className="text-amber-600 focus:text-amber-600">
              <ShieldAlert className="mr-2 size-4" />
              Signaler le contenu
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