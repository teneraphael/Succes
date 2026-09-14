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
      kyInstance
        .get(`/api/posts/${postId}/bookmark`)
        .json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const isBookmarking = !data.isBookmarkedByUser;

      const request = isBookmarking
        ? kyInstance.post(`/api/posts/${postId}/bookmark`)
        : kyInstance.delete(`/api/posts/${postId}/bookmark`);

      await request;

      // 🧠 TRACKING POUR L'ALGORITHME DEALCITY
      // On enregistre uniquement l'ajout aux favoris
      if (isBookmarking) {
        fetch("/api/posts/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: postId,
            type: "FAVORITE",
            itemType: "POST",
          }),
        }).catch((err) => {
          console.error(
            "Erreur tracking Bookmark:",
            err,
          );
        });
      }
    },

    // ⚡ Mise à jour optimiste
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousState =
        queryClient.getQueryData<BookmarkInfo>(
          queryKey,
        );

      queryClient.setQueryData<BookmarkInfo>(
        queryKey,
        () => ({
          isBookmarkedByUser:
            !previousState?.isBookmarkedByUser,
        }),
      );

      return {
        previousState,
      };
    },

    // ❌ En cas d'erreur, retour à l'ancien état
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        queryKey,
        context?.previousState,
      );

      console.error(error);

      toast({
        variant: "destructive",
        description:
          "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    },

    // 🔄 Synchronisation avec le serveur
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: ["bookmarks-feed"],
      });
    },
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        // 🔐 Utilisateur non connecté
        if (!loggedInUser) {
          toast({
            variant: "destructive",
            description:
              "Veuillez vous connecter pour enregistrer ce produit.",
          });

          return;
        }

        mutate();
      }}
      disabled={isPending}
      className="flex items-center gap-2 group transition-transform active:scale-125 disabled:opacity-50"
      aria-label={
        data.isBookmarkedByUser
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
    >
      <Bookmark
        className={cn(
          "size-5 transition-all duration-200",
          data.isBookmarkedByUser
            ? "fill-[#4a90e2] text-[#4a90e2] scale-110"
            : "text-muted-foreground group-hover:text-[#4a90e2]",
        )}
      />
    </button>
  );
}