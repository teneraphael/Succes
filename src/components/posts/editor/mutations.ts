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
      // On cible "for-you" ET le flux spécifique de l'auteur du post (soit toi, soit le pionnier substitué)
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(newPost.user.id)) // Utilise newPost.user.id pour être sûr de viser le bon profil
          );
        },
      };

      // 2. Annuler les requêtes en cours pour éviter que le serveur n'écrase notre mise à jour optimiste
      await queryClient.cancelQueries(queryFilter);

      // 3. Mise à jour optimiste du cache
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
      // On force le rafraîchissement uniquement si le cache était vide ou pour confirmer la donnée
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