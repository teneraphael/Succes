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

// ... (tes imports)

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          // On vérifie si c'est le flux "Pour vous"
          const isForYou = query.queryKey.includes("for-you");
          
          // On vérifie si c'est le flux d'un utilisateur
          const isUserPosts = query.queryKey.includes("user-posts");
          
          // ✅ LOGIQUE DE SUBSTITUTION : 
          // Si le post appartient à quelqu'un d'autre (admin a posté pour un vendeur),
          // on doit mettre à jour le flux de CE vendeur (newPost.userId)
          const isTargetUserFeed = query.queryKey.includes(newPost.userId);

          return isForYou || (isUserPosts && isTargetUserFeed);
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

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

      // Invalider pour être sûr que les compteurs (posts count) se mettent à jour
      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
        predicate(query) {
          return query.queryKey.includes(newPost.userId);
        }
      });

      toast({
        description: "Annonce publiée avec succès",
      });
    },
    // ... onError
  });

  return mutation;
}