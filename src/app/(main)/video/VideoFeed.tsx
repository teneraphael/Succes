"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import { useSession } from "@/app/(main)/SessionProvider"; // ✅ Ajouté pour la cohérence

export default function VideoFeed() {
  const { user } = useSession(); // ✅ On récupère l'utilisateur (peut être null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
  } = useInfiniteQuery({
    // On inclut l'ID de l'utilisateur dans la clé pour rafraîchir le feed 
    // si quelqu'un se connecte/déconnecte (gestion des états Like/Bookmark)
    queryKey: ["post-feed", "videos-only", user?.id || "anonymous"], 
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/posts/videos", {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // Garder les vidéos en cache un peu plus longtemps pour éviter les rechargements inutiles
    staleTime: 60 * 1000, 
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive my-5">
        Une erreur est survenue lors du chargement des vidéos.
      </p>
    );
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Aucune vidéo disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetching && (
        <div className="flex justify-center py-3">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
}