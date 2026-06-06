"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import TrackedPost from "@/components/posts/TrackedPost";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, ShoppingBag } from "lucide-react";

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
    // ✅ Clé unique par utilisateur pour éviter les mélanges de données connecté/anonyme
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
    // ✅ 2 tentatives pour absorber les micro-coupures réseau fréquentes sur mobile
    retry: 2,
    // ✅ Cache 5 min pour éviter de tout recharger entre navigations
    staleTime: 1000 * 60 * 5,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // ✅ Skeleton custom — style DealCity, remplace PostsLoadingSkeleton générique
  if (status === "pending") {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/40 bg-card p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-2 bg-muted rounded w-1/4" />
              </div>
            </div>
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ✅ État erreur avec bouton réessayer animé — style DealCity
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <RefreshCw className="size-6 text-red-500" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="font-black text-foreground text-sm uppercase tracking-tight">
            Erreur de chargement
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Impossible de charger le flux. Vérifiez votre connexion.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4a90e2]/10 hover:bg-[#4a90e2]/20 border border-[#4a90e2]/20 hover:border-[#4a90e2]/40 text-[#4a90e2] transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isFetching ? "Chargement..." : "Réessayer"}
          </span>
        </button>
      </div>
    );
  }

  // ✅ État vide — incite à explorer la marketplace
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
            <ShoppingBag className="size-7 text-[#4a90e2]" />
          </div>
          <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-card" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="font-black text-foreground text-sm uppercase tracking-tight">
            Aucun post disponible
          </p>
          <p className="text-xs text-muted-foreground font-medium max-w-[220px] leading-relaxed">
            Les meilleures offres de la communauté apparaîtront ici.
          </p>
        </div>
        {/* Badge DealCity */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
          <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            DealCity Marketplace
          </span>
        </div>
      </div>
    );
  }

  // ✅ Flux principal avec tracking des vues par post
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        // ✅ TrackedPost enveloppe chaque post pour enregistrer les impressions
        <TrackedPost key={post.id} post={post} userId={userId}>
          <Post post={post} />
        </TrackedPost>
      ))}

      {/* ✅ Loader pagination — couleur DealCity */}
      {isFetchingNextPage && (
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