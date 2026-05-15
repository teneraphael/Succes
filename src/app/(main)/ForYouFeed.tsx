"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import TrackedPost from "@/components/posts/TrackedPost"; 
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";

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
    refetch,
  } = useInfiniteQuery({
    // La clé de requête est unique pour éviter les mélanges de données
    queryKey: ["post-feed", "for-you", userId ?? "anonymous"],
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
    // On augmente la résilience face aux micro-coupures réseau (fréquentes sur mobile)
    retry: 2, 
    staleTime: 1000 * 60 * 5, // Garde les posts en cache 5 min pour éviter de tout recharger
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // 1. ÉTAT CHARGEMENT INITIAL
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // 2. ÉTAT ERREUR (C'est ce qui s'affiche sur ta capture d'écran)
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-10">
        <p className="text-center text-muted-foreground text-sm">
          Impossible de charger le flux. Vérifiez votre connexion.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 p-2 rounded-md transition-colors"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> 
          {isFetching ? "Chargement..." : "Réessayer"}
        </button>
      </div>
    );
  }

  // 3. ÉTAT VIDE
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center py-10">
        <p className="text-center text-muted-foreground">
          Aucun post disponible pour le moment.
        </p>
      </div>
    );
  }

  // 4. AFFICHAGE DU FLUX
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
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin text-primary" />}
    </InfiniteScrollContainer>
  );
}