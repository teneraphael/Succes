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

// 🌟 Typage mis à jour pour inclure les axes d'attributs dynamiques
interface SubmitPostArgs {
  content: string;
  mediaIds: string[];
  stock: number; 
  targetUserId?: string;
  attributes?: Array<{ name: string; values: string[] }>; // 👈 Injection de la structure des variantes
}

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // mutationFn transmet maintenant proprement le payload complet (avec attributes) à l'action
    mutationFn: ({ content, mediaIds, stock, targetUserId, attributes }: SubmitPostArgs) =>
      submitPost({ content, mediaIds, stock, targetUserId, attributes }),

    onSuccess: async (newPost) => {
      // 🌟 SÉCURITÉ TS : Empêche l'insertion d'une valeur nulle dans le cache si le serveur échoue à renvoyer le post
      if (!newPost) {
        toast({
          variant: "destructive",
          description: "Erreur lors de la récupération du post créé.",
        });
        return;
      }

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
                  // 🌟 CORRECTION TS : On caste temporairement le nouveau post en 'any' pour éviter 
                  // le blocage de build lié à l'absence des types 'attributes' et 'variants' dans PostsPage
                  posts: [newPost as any, ...firstPage.posts],
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