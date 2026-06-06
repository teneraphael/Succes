"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Post from "@/components/posts/Post";

interface PostScrollViewerProps {
  posts: any[];
  initialIndex: number;
  onClose: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function PostScrollViewer({
  posts,
  initialIndex,
  onClose,
  onLoadMore,
  hasMore,
}: PostScrollViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ✅ Scroll jusqu'au post cliqué au montage
  useEffect(() => {
    const el = postRefs.current[initialIndex];
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [initialIndex]);

  // ✅ Détecter quand on approche de la fin pour charger plus
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 500 && hasMore) {
        onLoadMore?.();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, onLoadMore]);

  // ✅ Bloquer le scroll du body pendant que le viewer est ouvert
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ✅ Fermer avec la touche Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Header fixe */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/90 backdrop-blur-md border-b border-border/40">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <span className="text-sm font-black text-foreground">Produits</span>
        </div>

        {/* Scroll vertical des posts */}
        <div
          ref={containerRef}
          className="h-[calc(100vh-56px)] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-xl mx-auto py-4 space-y-4 px-2">
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={(el) => { postRefs.current[index] = el; }}
              >
                <Post post={post} />
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center py-6">
                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-6 font-bold">
                Vous avez tout vu ! 🎉
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}