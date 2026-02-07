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
import { useSession } from "@/app/(main)/SessionProvider"; // ✅ Import de la session

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { user: loggedInUser } = useSession(); // ✅ Récupération de l'utilisateur
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
      const request = data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`);
      
      await request;

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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks-feed"] });
    }
  });

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        
        // ✅ PROTECTION : On bloque si l'utilisateur est null
        if (!loggedInUser) {
          toast({
            variant: "destructive",
            description: "Veuillez vous connecter pour enregistrer ce post.",
          });
          return;
        }

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