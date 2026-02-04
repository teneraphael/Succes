"use client";

import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      // 1. Action de Bookmark/Unbookmark en DB
      const request = data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`);
      
      await request;

      // 2. 🚀 SIGNAL ALGO : Si enregistrement, on track l'intérêt
      if (!data.isBookmarkedByUser) {
        await fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: postId, 
            type: "FAVORITE", 
            itemType: "POST" 
          }),
        }).catch(err => console.error("Algo tracking error (bookmark):", err));
      }
    },
    onMutate: async () => {
      // Message plus sympa en français
      toast({
        description: data.isBookmarkedByUser 
          ? "Retiré des favoris" 
          : "Enregistré dans vos favoris",
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    },
    // On invalide pour forcer la mise à jour des flux de favoris ailleurs
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-feed"] });
    }
  });

  return (
    <button 
      onClick={(e) => {
        e.preventDefault(); // Évite de cliquer sur le post si le bouton est dans une carte
        mutate();
      }} 
      className="flex items-center gap-2 group"
    >
      <Bookmark
        className={cn(
          "size-5 transition-colors group-hover:text-primary",
          data.isBookmarkedByUser 
            ? "fill-primary text-primary" 
            : "text-muted-foreground",
        )}
      />
    </button>
  );
}