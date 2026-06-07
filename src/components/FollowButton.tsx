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

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      // ✅ Mise à jour optimiste
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers: (previousState?.followers || 0) + (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      // ✅ Rollback si erreur réseau
      queryClient.setQueryData(queryKey, context?.previousState);
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
        // ✅ Bloque l'action si non connecté
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
      {/* ✅ Labels traduits */}
      {isPending ? "..." : isFollowing ? t.unfollow : t.follow}
    </button>
  );
}