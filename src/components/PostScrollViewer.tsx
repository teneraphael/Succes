"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const loadMoreTriggered = useRef(false);
  const minScrollTop = useRef(0);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const el = postRefs.current[initialIndex];
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
      setTimeout(() => {
        const container = containerRef.current;
        if (container) {
          minScrollTop.current = container.scrollTop;
          lastScrollTop.current = container.scrollTop;
        }
      }, 100);
    }
  }, [initialIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    postRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentIndex(index);
              if (index >= posts.length - 3 && hasMore && !loadMoreTriggered.current) {
                loadMoreTriggered.current = true;
                onLoadMore?.();
                setTimeout(() => { loadMoreTriggered.current = false; }, 2000);
              }
            }
          });
        },
        { threshold: 0.6 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [posts.length, hasMore, onLoadMore]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop } = container;
    if (scrollTop < minScrollTop.current) {
      container.scrollTop = minScrollTop.current;
      return;
    }
    lastScrollTop.current = scrollTop;
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
        style={{ height: "100dvh" }}
      >
        {/* ✅ Header */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-background/90 backdrop-blur-md border-b border-border/40 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#4a90e2]/10 hover:text-[#4a90e2] transition-all active:scale-95"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <span className="text-sm font-black uppercase tracking-widest text-foreground">
            Produits
          </span>
          <span className="ml-auto text-[10px] font-black text-muted-foreground">
            {currentIndex + 1} / {posts.length}
          </span>
        </div>

        {/* ✅ Container scroll snap */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-y-scroll overscroll-contain"
          style={{
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            flex: "1 1 0",
            height: 0,
          }}
        >
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={(el) => { postRefs.current[index] = el; }}
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                minHeight: "100%",
              }}
              className="flex flex-col justify-start overflow-y-auto"
            >
              {/* ✅ Plein écran bord à bord — suppression max-w-xl, mx-auto, px-2 */}
              <div className="w-full">
                <Post post={post} fullWidth />
              </div>
            </div>
          ))}

          {hasMore && (
            <div
              style={{ scrollSnapAlign: "start", minHeight: "100%" }}
              className="flex items-center justify-center"
            >
              <div className="size-6 border-2 border-[#4a90e2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div
              style={{ scrollSnapAlign: "start", minHeight: "40dvh" }}
              className="flex flex-col items-center justify-center gap-2"
            >
              <p className="text-2xl">🎉</p>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Vous avez tout vu !
              </p>
            </div>
          )}
        </div>

        {/* ✅ Indicateurs */}
        {posts.length > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-1.5 py-2 bg-background/80 border-t border-border/30">
            {posts.slice(0, Math.min(posts.length, 7)).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-4 h-1.5 bg-[#4a90e2]"
                    : "w-1.5 h-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
            {posts.length > 7 && (
              <span className="text-[9px] text-muted-foreground font-bold ml-1">
                +{posts.length - 7}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}