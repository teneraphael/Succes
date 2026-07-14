"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";
import { UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({ userId, initialState }: FollowButtonProps) {
  const { user: loggedInUser } = useSession();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];
const { mutate, isPending } = useMutation<
    void,
    Error,
    void,
    { previousState: FollowerInfo | undefined; previousPostFeed: any }
  >({
    // ✅ En ajoutant une fonction asynchrone explicite qui ne retourne rien (void)
    mutationFn: async () => {
      if (data.isFollowedByUser) {
        await kyInstance.delete(`/api/users/${userId}/followers`);
      } else {
        await kyInstance.post(`/api/users/${userId}/followers`);
      }
    },
    onMutate: async () => {
      // 1. On annule les requêtes en cours pour éviter les conflits d'écrasement
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ["post-feed"] });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      const previousPostFeed = queryClient.getQueryData<any>(["post-feed"]);

      const willFollow = !previousState?.isFollowedByUser;

      // 2. Mise à jour optimiste de l'état de suivi individuel
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers: (previousState?.followers || 0) + (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: willFollow,
      }));

      // 3. Mise à jour optimiste dans tout le flux de posts en cache
      if (previousPostFeed) {
        queryClient.setQueryData(["post-feed"], (old: any) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              if (!page.posts) return page;
              return {
                ...page,
                posts: page.posts.map((post: any) => {
                  if (post.user.id === userId) {
                    return {
                      ...post,
                      user: {
                        ...post.user,
                        isFollowedByUser: willFollow,
                      },
                    };
                  }
                  return post;
                }),
              };
            }),
          };
        });
      }

      return { previousState, previousPostFeed };
    },
    onSuccess: () => {
      // On force la synchronisation réelle avec le serveur en arrière-plan
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
    onError(error, variables, context) {
      // Rollback complet des deux caches si la requête échoue (ex: perte réseau)
      if (context?.previousState) {
        queryClient.setQueryData(queryKey, context.previousState);
      }
      if (context?.previousPostFeed) {
        queryClient.setQueryData(["post-feed"], context.previousPostFeed);
      }
      
      console.error(error);
      toast({
        variant: "destructive",
        description: t.error_loading,
      });
    },
  });

  const isFollowing = data.isFollowedByUser;

  return (
    <button
      onClick={() => {
        if (!loggedInUser) {
          toast({
            variant: "destructive",
            description: t.login,
          });
          return;
        }
        mutate();
      }}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        isFollowing
          ? "bg-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-border text-muted-foreground"
          : "bg-[#4a90e2] hover:bg-[#357abd] text-white shadow-lg shadow-[#4a90e2]/20 border border-[#4a90e2]"
      )}
    >
      {isFollowing ? (
        <UserMinus className="size-3.5" />
      ) : (
        <UserPlus className="size-3.5" />
      )}
      {isPending ? "..." : isFollowing ? t.unfollow : t.follow}
    </button>
  );
}