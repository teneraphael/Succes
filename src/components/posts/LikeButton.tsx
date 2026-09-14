"use client";

import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

async function trackLike(postId: string) {
  try {
    await fetch("/api/posts/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: postId,
        type: "LIKE",
        itemType: "POST",
      }),
    });
  } catch (error) {
    console.error("Erreur tracking LIKE:", error);
  }
}

export default function LikeButton({
  postId,
  initialState,
}: LikeButtonProps) {
  const { user: loggedInUser } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/posts/${postId}/likes`)
        .json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const isLiking = !data.isLikedByUser;

      if (isLiking) {
        await kyInstance.post(`/api/posts/${postId}/likes`);

        // ❤️ Signal envoyé uniquement lorsqu'on LIKE
        trackLike(postId);
      } else {
        await kyInstance.delete(`/api/posts/${postId}/likes`);
      }
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) +
          (previousState?.isLikedByUser ? -1 : 1),

        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },

    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        queryKey,
        context?.previousState,
      );

      toast({
        variant: "destructive",
        description:
          "Une erreur réseau est survenue. Votre action n'a pas été enregistrée.",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleClick = () => {
    if (!loggedInUser) {
      toast({
        variant: "destructive",
        description:
          "Veuillez vous connecter pour aimer ce post.",
      });

      return;
    }

    if (!isPending) {
      mutate();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 group transition-transform active:scale-125",
        isPending && "opacity-60 cursor-not-allowed",
      )}
    >
      <Heart
        className={cn(
          "size-5 transition-all duration-200",
          data.isLikedByUser
            ? "fill-red-500 text-red-500 scale-110"
            : "text-muted-foreground group-hover:text-red-500",
        )}
      />

      <span
        className={cn(
          "text-xs font-black tabular-nums transition-colors",
          data.isLikedByUser
            ? "text-red-500"
            : "text-muted-foreground group-hover:text-red-500",
        )}
      >
        {data.likes}
      </span>
    </button>
  );
}