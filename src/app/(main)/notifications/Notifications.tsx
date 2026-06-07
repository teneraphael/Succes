"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, Bell } from "lucide-react";
import { useEffect } from "react";
import Notification from "./Notification";
import { useLanguage } from "@/components/LanguageProvider";

function NotificationsSkeleton() {
  return (
    <div className="w-full bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl overflow-hidden divide-y divide-border/40">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-4 animate-pulse">
          <div className="size-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-8 bg-muted rounded-xl w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Notifications() {
  const { t } = useLanguage();

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
      queryClient.setQueryData(["unread-notification-count"], { unreadCount: 0 });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") return <NotificationsSkeleton />;

  // ✅ Erreur traduite
  if (status === "error") {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl">
        <p className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
          {t.error_loading}
        </p>
      </div>
    );
  }

  // ✅ État vide traduit
  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <div className="w-full bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl p-14 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
            <Bell className="size-7 text-[#4a90e2]" />
          </div>
          <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-card flex items-center justify-center">
            <span className="text-[8px] text-white font-black">0</span>
          </div>
        </div>

        <div className="text-center space-y-1.5">
          {/* ✅ Titre et description traduits */}
          <p className="font-black text-foreground text-sm uppercase tracking-tight">
            {t.no_notifications}
          </p>
          <p className="text-xs text-muted-foreground font-medium max-w-[220px] leading-relaxed">
            {t.no_notifications_desc}
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
          <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            DealCity
          </span>
        </div>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="w-full bg-card border-y sm:border border-border/60 rounded-none sm:rounded-2xl overflow-hidden"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}

      {/* ✅ Loader traduit */}
      {isFetchingNextPage && (
        <div className="w-full py-5 flex justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-[#4a90e2]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t.loading}
            </span>
          </div>
        </div>
      )}
    </InfiniteScrollContainer>
  );
}