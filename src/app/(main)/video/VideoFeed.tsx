"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post"; // On réutilise ton composant Post optimisé

export default function VideoFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "videos-only"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/posts/videos", {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") return <Loader2 className="mx-auto animate-spin" />;

  if (status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">Aucune vidéo disponible pour le moment.</p>;
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {posts.map((post) => (
        // Ton composant Post gère déjà l'autoplay et le son grâce à nos modifs
        <Post key={post.id} post={post} />
      ))}
      {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}