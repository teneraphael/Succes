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
  Loader2 // Import pour le chargement
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
  const [isReporting, setIsReporting] = useState(false); // État de chargement pour le signalement

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
        // Le serveur renvoie maintenant un statut 400 si déjà signalé
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
        description: error.message // Affichera "Vous avez déjà signalé ce contenu."
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
        <DropdownMenuContent align="end" className="w-56">
          
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

          {post.attachments.length > 0 && (
            <DropdownMenuItem onClick={downloadMedia}>
              <Download className="mr-2 size-4" />
              Enregistrer les médias
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {post.user.id === user.id ? (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Supprimer mon annonce
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleReport} 
              disabled={isReporting}
              className="text-amber-600 focus:text-amber-600 font-medium cursor-pointer"
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