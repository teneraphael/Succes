"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { Loader2, Film, VideoOff } from "lucide-react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import VideoPost from "@/components/VideoPost"; // ✅ Utilisation du lecteur vidéo immersif
import { useSession } from "@/app/(main)/SessionProvider";

export default function VideoFeed() {
  const { user } = useSession();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "videos-only", user?.id || "anonymous"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/posts/videos", {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/40 bg-card overflow-hidden animate-pulse"
          >
            <div className="h-[500px] bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="size-14 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
          <VideoOff className="size-6 text-[#4a90e2]" />
        </div>
        <p className="text-sm font-bold text-foreground">Impossible de charger les vidéos.</p>
        <p className="text-xs text-muted-foreground">Vérifiez votre connexion Internet, puis réessayez.</p>
        <button type="button" onClick={() => refetch()} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Réessayer</button>
      </div>
    );
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
            <Film className="size-7 text-[#4a90e2]" />
          </div>
          <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-card" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="font-black text-foreground text-sm uppercase tracking-tight">
            Aucune vidéo disponible
          </p>
          <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">
            Les vidéos de la communauté apparaîtront ici.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
          <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            DealCity Vidéos
          </span>
        </div>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-4"
    >
      {posts.map((post) => {
        const videoAttachment = post.attachments?.find((m: any) => m.type === "VIDEO") || post.attachments?.[0];
        if (!videoAttachment) return null;

        return (
          <VideoPost
            key={post.id}
            post={post}
            src={videoAttachment.url}
            poster={post.thumbnailUrl || videoAttachment.settings?.thumbnailUrl || undefined}
          />
        );
      })}

      {isFetching && (
        <div className="flex items-center justify-center gap-2 py-5">
          <Loader2 className="size-4 animate-spin text-[#4a90e2]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Chargement...
          </span>
        </div>
      )}
    </InfiniteScrollContainer>
  );
}