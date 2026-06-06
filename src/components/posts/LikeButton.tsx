"use client";

import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { user: loggedInUser } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      const isLiking = !data.isLikedByUser;

      const request = isLiking
        ? kyInstance.post(`/api/posts/${postId}/likes`)
        : kyInstance.delete(`/api/posts/${postId}/likes`);

      await request;

      // ✅ Tracking algo — enregistre le like pour l'algorithme de recommandation
      if (isLiking) {
        fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: postId,
            type: "FAVORITE",
            itemType: "POST",
          }),
        }).catch((err) => console.error("Algo tracking error:", err));
      }
    },
    onMutate: async () => {
      // ✅ Annule les requêtes en cours pour éviter les conflits de cache
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      // ✅ Mise à jour optimiste — UI réactive sans attendre le serveur
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes: (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      // ✅ Rollback si erreur réseau ou serveur
      queryClient.setQueryData(queryKey, context?.previousState);
      toast({
        variant: "destructive",
        description: "Une erreur réseau est survenue. Votre action n'a pas été enregistrée.",
      });
    },
    // ✅ Synchronisation finale avec le serveur pour garantir le bon compteur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <button
      onClick={() => {
        // ✅ Bloque l'action si non connecté
        if (!loggedInUser) {
          toast({
            variant: "destructive",
            description: "Veuillez vous connecter pour aimer ce post.",
          });
          return;
        }
        mutate();
      }}
      className="flex items-center gap-1.5 group transition-transform active:scale-125"
    >
      <Heart
        className={cn(
          "size-5 transition-all duration-200",
          // ✅ Cœur rouge rempli si liké, gris avec hover rouge sinon
          data.isLikedByUser
            ? "fill-red-500 text-red-500 scale-110"
            : "text-muted-foreground group-hover:text-red-500",
        )}
      />
      <span
        className={cn(
          "text-xs font-black tabular-nums transition-colors",
          // ✅ Compteur rouge si liké, gris sinon
          data.isLikedByUser
            ? "text-red-500"
            : "text-muted-foreground group-hover:text-red-500",
        )}
      >
        {data.likes}
      </span>
    </button>
  );
}