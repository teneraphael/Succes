import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";

export function useUpdateProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Déclaration des deux UploadThings configurés dans ton fichier core.ts
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");
  const { startUpload: startCoverUpload } = useUploadThing("coverPicture");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
      cover,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
      cover?: File;
    }) => {
      // On lance toutes les opérations en parallèle pour un gain de performance maximal
      return Promise.all([
        updateUserProfile(values),
        avatar ? startAvatarUpload([avatar]) : undefined,
        cover ? startCoverUpload([cover]) : undefined,
      ]);
    },
    onSuccess: async ([updatedUser, avatarUploadResult, coverUploadResult]) => {
      // Extraction des URLs renvoyées par UploadThing après un téléversement réussi
      const newAvatarUrl = avatarUploadResult?.[0].serverData.avatarUrl;
      const newCoverUrl = coverUploadResult?.[0].serverData.coverUrl;

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      // Annulation des requêtes en cours pour éviter d'écraser l'état local rafraîchi
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                // Si le post appartient à l'utilisateur mis à jour, on applique les nouveaux visuels
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
                      coverUrl: newCoverUrl || (updatedUser as any).coverUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      // Force Next.js à invalider le cache serveur pour recalculer le rendu du composant Page (Server Component)
      router.refresh();

      toast({
        description: "Profile updated successfully",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  return mutation;
}