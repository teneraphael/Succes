"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import TrackedPost from "@/components/posts/TrackedPost"; 
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react"; // Ajout de RefreshCw pour le bouton

interface ForYouFeedProps {
  userId?: string;
}

export default function ForYouFeed({ userId }: ForYouFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch, // Ajout de refetch pour permettre de réessayer
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/posts/for-you", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: 3, // Tente 3 fois avant d'afficher l'erreur (très important pour les connexions instables)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), 
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        Aucun post disponible pour le moment.
      </p>
    );
  }

  // --- VERSION CORRIGÉE POUR L'ERREUR RÉSEAU ---
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-10">
        <p className="text-center text-muted-foreground text-sm">
          Impossible de charger le flux. Vérifiez votre connexion.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    );
  }
  // --------------------------------------------

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <TrackedPost key={post.id} post={post} userId={userId}>
          <Post post={post} />
        </TrackedPost>
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}