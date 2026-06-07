"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostScrollViewer from "@/components/PostScrollViewer";
import { useLanguage } from "@/components/LanguageProvider";

interface SearchResultsProps {
  query: string;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const descMatch = content.match(/📝\s*DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|$)/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim().slice(0, 80) : content.slice(0, 80),
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

function ProductCard({ post, onClick }: { post: any; onClick: () => void }) {
  const { t } = useLanguage();
  const { productName, price, description } = extractInfo(post.content);
  const firstImage = post.attachments?.find((m: any) => m.type === "IMAGE")?.url;
  const isAvailable = (post.stock ?? 0) > 0 || post.variants?.some((v: any) => v.stock > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
    >
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={productName || "Produit"}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={isExternalImage(firstImage)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="size-10 text-muted-foreground/30" />
          </div>
        )}

        {/* ✅ Badge épuisé traduit */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-red-500 px-2 py-1 rounded-full">
              {t.out_of_stock}
            </span>
          </div>
        )}

        {post.user?.isVerified && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              ✓ Vérifié
            </span>
          </div>
        )}

        {post.attachments?.filter((m: any) => m.type === "IMAGE").length > 1 && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              +{post.attachments.filter((m: any) => m.type === "IMAGE").length}
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1">
        <p className="text-[11px] font-black uppercase tracking-tight text-foreground line-clamp-2 leading-tight">
          {productName || "Article"}
        </p>
        {description && (
          <p className="text-[9px] text-muted-foreground line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[12px] font-black text-emerald-600">
            {price ? `${parseInt(price).toLocaleString()} FCFA` : "—"}
          </span>
          <div className="flex items-center gap-1">
            <Image
              src={post.user?.avatarUrl || "/icons/icon-192.png"}
              alt={post.user?.displayName || ""}
              width={16}
              height={16}
              className="rounded-full object-cover"
              unoptimized={isExternalImage(post.user?.avatarUrl || "")}
            />
            <span className="text-[8px] text-muted-foreground font-bold truncate max-w-[60px]">
              {post.user?.displayName}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/40 animate-pulse">
          <div className="aspect-square bg-muted" />
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="w-full min-h-screen">

      {/* ✅ Header traduit */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <Search className="size-4 text-muted-foreground flex-none" />
          <div className="flex-1">
            <p className="text-sm font-black text-foreground truncate">
              {query ? `"${query}"` : t.no_results}
            </p>
            {posts.length > 0 && (
              <p className="text-[10px] text-muted-foreground font-bold">
                {posts.length}+ {t.search_results}
              </p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "pending" && <GridSkeleton />}

        {/* ✅ Erreur traduite */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-destructive font-bold text-sm">{t.error_loading}</p>
          </div>
        )}

        {/* ✅ État vide traduit */}
        {status === "success" && !posts.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
              <Search className="size-7 text-[#4a90e2]" />
            </div>
            <div className="text-center">
              <p className="font-black text-foreground uppercase tracking-tight">
                {t.no_results}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t.no_results_desc} &quot;{query}&quot;
              </p>
            </div>
          </motion.div>
        )}

        {status === "success" && posts.length > 0 && (
          <InfiniteScrollContainer
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
              {posts.map((post, index) => (
                <ProductCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedIndex(index)}
                />
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-[#4a90e2]" />
              </div>
            )}
          </InfiniteScrollContainer>
        )}
      </AnimatePresence>

      {selectedIndex !== null && (
        <PostScrollViewer
          posts={posts}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onLoadMore={() => hasNextPage && !isFetching && fetchNextPage()}
          hasMore={hasNextPage ?? false}
        />
      )}
    </div>
  );
}