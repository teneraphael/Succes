"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PostScrollViewer from "@/components/PostScrollViewer";
import { useLanguage } from "@/components/LanguageProvider";

interface UserPostsProps {
  userId: string;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

function ProductCard({ post, index, onClick }: { post: any; index: number; onClick: () => void }) {
  const { t } = useLanguage();
  const { productName, price } = extractInfo(post.content);

  // ✅ Priorité image, sinon première vidéo
  const firstImage = post.attachments?.find((m: any) => m.type === "IMAGE")?.url;
  const firstVideo = post.attachments?.find((m: any) => m.type === "VIDEO")?.url;
  const isVideo = !firstImage && !!firstVideo;
  const imageCount = post.attachments?.filter((m: any) => m.type === "IMAGE").length || 0;
  const isAvailable = (post.stock ?? 0) > 0 || post.variants?.some((v: any) => v.stock > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
    >
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">

        {/* ✅ Image en priorité */}
        {firstImage ? (
          <Image
            src={firstImage}
            alt={productName || "Produit"}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={isExternalImage(firstImage)}
          />
        ) : isVideo ? (
          // ✅ Miniature vidéo — lecture silencieuse en boucle
          <video
            src={firstVideo}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <ShoppingBag className="size-10 text-muted-foreground/30" />
          </div>
        )}

        {/* ✅ Badge vidéo */}
        {isVideo && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
            ▶ Video
          </div>
        )}

        {/* Badge épuisé */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white text-[9px] font-black uppercase tracking-widest bg-red-500 px-2 py-1 rounded-full">
              {t.out_of_stock}
            </span>
          </div>
        )}

        {/* Badge multiple images */}
        {imageCount > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            +{imageCount}
          </div>
        )}

        {/* Compteur likes */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
          ❤️ {post._count?.likes || 0}
        </div>
      </div>

      <div className="p-2.5 space-y-1">
        <p className="text-[11px] font-black uppercase tracking-tight text-foreground line-clamp-2 leading-tight">
          {productName || "Article"}
        </p>
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[12px] font-black",
            isAvailable ? "text-emerald-600" : "text-muted-foreground line-through"
          )}>
            {price ? `${parseInt(price).toLocaleString()} FCFA` : "—"}
          </span>
          <span className="text-[9px] text-muted-foreground font-bold">
            {post._count?.comments || 0} 💬
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
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

export default function UserPosts({ userId }: UserPostsProps) {
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
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") return <GridSkeleton />;

  if (status === "error") {
    return (
      <p className="text-center text-destructive text-sm py-10">
        {t.error_loading}
      </p>
    );
  }

  if (status === "success" && !posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
          <ShoppingBag className="size-7 text-[#4a90e2]" />
        </div>
        <div className="text-center">
          <p className="font-black text-foreground text-sm uppercase tracking-tight">
            {t.no_products}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.no_products_desc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <InfiniteScrollContainer
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        <AnimatePresence>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {posts.map((post, index) => (
              <ProductCard
                key={post.id}
                post={post}
                index={index}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </AnimatePresence>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-[#4a90e2]" />
          </div>
        )}
      </InfiniteScrollContainer>

      {selectedIndex !== null && (
        <PostScrollViewer
          posts={posts}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onLoadMore={() => hasNextPage && !isFetching && fetchNextPage()}
          hasMore={hasNextPage ?? false}
        />
      )}
    </>
  );
}