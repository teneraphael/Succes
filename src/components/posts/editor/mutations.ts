"use client";

import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";

// Typage des arguments attendus par la mutation pour une sécurité maximale
interface SubmitPostArgs {
  content: string;
  mediaIds: string[];
  stock: number; // 📦 Ajout du typage pour le stock
  targetUserId?: string;
}

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // mutationFn reçoit maintenant explicitement l'objet structuré envoyé par le PostEditor
    mutationFn: ({ content, mediaIds, stock, targetUserId }: SubmitPostArgs) =>
      submitPost({ content, mediaIds, stock, targetUserId }),

    onSuccess: async (newPost) => {
      // 1. Définir les flux à mettre à jour
      // On cible "for-you" ET le flux spécifique de l'auteur du post (soit toi, soit le pionnier substitué)
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(newPost.user.id)) // Utilise newPost.user.id pour viser le bon profil
          );
        },
      };

      // 2. Annuler les requêtes en cours pour éviter que le serveur n'écrase notre mise à jour optimiste
      await queryClient.cancelQueries(queryFilter);

      // 3. Mise à jour optimiste du cache TanStack Query
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          const firstPage = oldData.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // 4. Invalidation ciblée
      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
        predicate(query) {
          return queryFilter.predicate!(query);
        },
      });

      toast({
        description: "Publication réussie !",
      });
    },
    onError(error) {
      console.error("Mutation Error:", error);
      toast({
        variant: "destructive",
        description: "Échec de la publication. Veuillez réessayer.",
      });
    },
  });

  return mutation;
}