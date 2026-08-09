"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, ShoppingBag, Search, X } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PostScrollViewer from "@/components/PostScrollViewer";
import { useLanguage } from "@/components/LanguageProvider";

interface UserPostsProps {
  userId: string;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim().replace(/\s/g, "") : null,
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

function ProductCard({ post, index, onClick }: { post: any; index: number; onClick: () => void }) {
  const { t } = useLanguage();
  const { productName, price } = extractInfo(post.content);

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

        {isVideo && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
            ▶ Video
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white text-[9px] font-black uppercase tracking-widest bg-red-500 px-2 py-1 rounded-full">
              {t.out_of_stock}
            </span>
          </div>
        )}

        {imageCount > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            +{imageCount}
          </div>
        )}

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  // ✅ Filtrage local par nom de produit
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;
    const q = searchQuery.toLowerCase().trim();
    return allPosts.filter((post) => {
      const { productName } = extractInfo(post.content);
      return (
        productName?.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q)
      );
    });
  }, [allPosts, searchQuery]);

  if (status === "pending") return <GridSkeleton />;

  if (status === "error") {
    return (
      <p className="text-center text-destructive text-sm py-10">
        {t.error_loading}
      </p>
    );
  }

  if (status === "success" && !allPosts.length) {
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
      {/* ✅ Barre de recherche catalogue */}
      <div className="mb-4 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans le catalogue..."
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-card border border-border/60 focus:border-[#4a90e2]/40 focus:outline-none focus:ring-1 focus:ring-[#4a90e2]/20 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
          />
          {/* ✅ Bouton clear */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Résultats count */}
        <AnimatePresence>
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] font-bold text-muted-foreground mt-2 px-1"
            >
              {filteredPosts.length > 0
                ? `${filteredPosts.length} produit${filteredPosts.length > 1 ? "s" : ""} trouvé${filteredPosts.length > 1 ? "s" : ""}`
                : "Aucun produit trouvé"
              }
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ État vide après recherche */}
      {searchQuery && filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
            <Search className="size-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-tight">
            Aucun résultat
          </p>
          <p className="text-xs text-muted-foreground/60">
            Essayez un autre mot-clé
          </p>
        </div>
      )}

      {/* ✅ Grille produits filtrés */}
      {filteredPosts.length > 0 && (
        <InfiniteScrollContainer
          onBottomReached={() => !searchQuery && hasNextPage && !isFetching && fetchNextPage()}
        >
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPosts.map((post, index) => (
                <ProductCard
                  key={post.id}
                  post={post}
                  index={index}
                  onClick={() => {
                    const realIndex = allPosts.findIndex(p => p.id === post.id);
                    setSelectedIndex(realIndex >= 0 ? realIndex : index);
                  }}
                />
              ))}
            </div>
          </AnimatePresence>

          {isFetchingNextPage && !searchQuery && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-[#4a90e2]" />
            </div>
          )}
        </InfiniteScrollContainer>
      )}

      {selectedIndex !== null && (
        <PostScrollViewer
          posts={allPosts}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onLoadMore={() => hasNextPage && !isFetching && fetchNextPage()}
          hasMore={hasNextPage ?? false}
        />
      )}
    </>
  );
}