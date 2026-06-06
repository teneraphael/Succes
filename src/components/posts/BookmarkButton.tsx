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
import { useSession } from "@/app/(main)/SessionProvider";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { user: loggedInUser } = useSession();
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
      const isBookmarking = !data.isBookmarkedByUser;

      const request = isBookmarking
        ? kyInstance.post(`/api/posts/${postId}/bookmark`)
        : kyInstance.delete(`/api/posts/${postId}/bookmark`);

      await request;

      // ✅ Tracking algo — enregistre l'action favori pour l'algorithme
      if (isBookmarking) {
        fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: postId,
            type: "FAVORITE",
            itemType: "POST",
          }),
        }).catch((err) => console.error("Algo tracking error (bookmark):", err));
      }
    },
    onMutate: async () => {
      // ✅ Notification instantanée avant la réponse serveur
      toast({
        description: data.isBookmarkedByUser
          ? "Retiré des favoris"
          : "Enregistré dans vos favoris",
      });

      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      // ✅ Mise à jour optimiste du cache — UI réactive sans attendre le serveur
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      // ✅ Rollback si erreur réseau
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    },
    onSettled: () => {
      // ✅ Synchronisation du feed favoris après mutation
      queryClient.invalidateQueries({ queryKey: ["bookmarks-feed"] });
    },
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();

        // ✅ Bloque l'action si non connecté
        if (!loggedInUser) {
          toast({
            variant: "destructive",
            description: "Veuillez vous connecter pour enregistrer ce post.",
          });
          return;
        }

        mutate();
      }}
      className="flex items-center gap-2 group transition-transform active:scale-125"
    >
      <Bookmark
        className={cn(
          "size-5 transition-all duration-200",
          // ✅ Rempli en bleu DealCity si bookmarké, gris sinon
          data.isBookmarkedByUser
            ? "fill-[#4a90e2] text-[#4a90e2] scale-110"
            : "text-muted-foreground group-hover:text-[#4a90e2]",
        )}
      />
    </button>
  );
}