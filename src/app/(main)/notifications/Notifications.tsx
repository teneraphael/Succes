"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, BellOff } from "lucide-react";
import { useEffect } from "react";
import Notification from "./Notification";

export default function Notifications() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-read"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // ÉTAT VIDE : Stylisé pour correspondre au look minimaliste et premium
  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <div className="w-full bg-white dark:bg-card border sm:border border-border/60 rounded-none sm:rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <span className="p-3.5 rounded-xl bg-muted/50 border border-border/40 text-muted-foreground/40">
          <BellOff className="size-5 stroke-[1.8]" />
        </span>
        <p className="text-sm font-medium font-sans italic">
          Ton espace est calme. Aucune notification pour le moment.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-8 text-center bg-destructive/5 border border-destructive/10 rounded-xl">
        <p className="text-sm font-medium text-destructive">
          Une erreur est survenue lors du chargement des notifications.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="w-full bg-white dark:bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] divide-y divide-border/40 overflow-hidden"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
      
      {isFetchingNextPage && (
        <div className="w-full py-4 flex justify-center">
          <Loader2 className="size-5 animate-spin text-amber-600/70" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}