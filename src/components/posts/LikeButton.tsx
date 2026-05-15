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

      // Tracking algorithmique (lancé après la réussite du like)
      if (isLiking) {
        fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: postId, 
            type: "FAVORITE", 
            itemType: "POST" 
          }),
        }).catch(err => console.error("Algo tracking error:", err));
      }
    },
    onMutate: async () => {
      // Annuler les rafraîchissements en cours pour cette Query spécifique
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      // Mise à jour immédiate du cache (Optimiste)
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes: (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      // Retour en arrière si le serveur ou le réseau échoue
      queryClient.setQueryData(queryKey, context?.previousState);
      toast({
        variant: "destructive",
        description: "Une erreur réseau est survenue. Votre action n'a pas été enregistrée.",
      });
    },
    // On synchronise avec le serveur à la fin pour être sûr du compte final
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <button 
      onClick={() => {
        if (!loggedInUser) {
          toast({ variant: "destructive", description: "Veuillez vous connecter pour aimer ce post." });
          return;
        }
        mutate();
      }} 
      className={cn(
        "flex items-center gap-1.5 transition-transform active:scale-125", // Petit effet de scale au clic
        "hover:opacity-80"
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes}
      </span>
    </button>
  );
}