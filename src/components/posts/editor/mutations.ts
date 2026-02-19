"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // 1. Définir les flux à mettre à jour
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            // ✅ On cible dynamiquement le flux du vendeur (userId du post créé)
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(newPost.userId))
          );
        },
      } satisfies QueryFilters;

      // 2. Annuler les requêtes en cours pour éviter les écrasements
      await queryClient.cancelQueries(queryFilter);

      // 3. Mise à jour optimiste du cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

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

      // 4. Invalidation pour garantir la synchronisation avec le serveur
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
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