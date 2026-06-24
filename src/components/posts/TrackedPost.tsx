"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface TrackedPostProps {
  post: any;
  userId?: string;
  children: React.ReactNode;
}

export default function TrackedPost({ post, userId, children }: TrackedPostProps) {
  const hasTracked = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0.7,
    triggerOnce: true,
  });

  // ✅ Tracking VIEW — 1.5s de visibilité avant d'enregistrer
  useEffect(() => {
    if (!inView || hasTracked.current) return;

    const timer = setTimeout(async () => {
      hasTracked.current = true;
      try {
        await fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: post.id,
            type: "VIEW",
            itemType: "POST",
          }),
        });
      } catch {
        // Erreur réseau ignorée silencieusement
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [inView, post.id]);

  return (
    <div ref={ref} className="w-full">
      {children}
    </div>
  );
}