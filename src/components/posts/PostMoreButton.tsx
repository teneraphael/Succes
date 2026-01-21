"use client";

import { PostData } from "@/lib/types";
import { MoreHorizontal, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeletePostDialog from "./DeletePostDialog";
import { useSession } from "@/app/(main)/SessionProvider"; // Import pour vérifier l'utilisateur

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({
  post,
  className,
}: PostMoreButtonProps) {
  const { user } = useSession(); // On récupère l'utilisateur connecté
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fonction pour envoyer le signalement à l'API
  async function handleReport() {
    try {
      const response = await fetch(`/api/posts/${post.id}/report`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du signalement");
      }

      alert("Merci ! Ce contenu a été signalé comme non-commercial. La communauté DealCity vous remercie.");
    } catch (error: any) {
      alert(error.message || "Vous avez déjà signalé ce post.");
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
        <DropdownMenuContent align="end">
          
          {/* OPTION 1 : Supprimer (Uniquement pour le propriétaire du post) */}
          {post.user.id === user.id && (
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
              <span className="flex items-center gap-3 text-destructive font-medium">
                <Trash2 className="size-4" />
                Supprimer
              </span>
            </DropdownMenuItem>
          )}

          {/* OPTION 2 : Signaler (Pour les autres utilisateurs uniquement) */}
          {post.user.id !== user.id && (
            <DropdownMenuItem onClick={handleReport}>
              <span className="flex items-center gap-3 text-amber-600 font-medium">
                <ShieldAlert className="size-4" />
                Signaler comme non-commercial
              </span>
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