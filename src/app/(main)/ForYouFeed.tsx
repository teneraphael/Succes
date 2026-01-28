"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import TrackedPost from "@/components/posts/TrackedPost"; // On importe le surveillant
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you", userId], 
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you", // Route de ton algo de recommandation
          {
            searchParams: {
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          }
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        Une erreur est survenue lors du chargement du fil d&apos;actualité.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        /* ✅ On enveloppe le post pour tracker la vue sans clic */
        <TrackedPost key={post.id} post={post} userId={userId}>
          <Post post={post} />
        </TrackedPost>
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}