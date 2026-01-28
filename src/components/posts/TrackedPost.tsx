"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer"; // npx i react-intersection-observer

interface TrackedPostProps {
  post: any;
  userId?: string;
  children: React.ReactNode;
}

export default function TrackedPost({ post, userId, children }: TrackedPostProps) {
  const { ref, inView } = useInView({
    threshold: 0.7, // Le post doit être visible à 70%
    triggerOnce: true, // On ne compte la vue qu'une fois par session de scroll
  });

  useEffect(() => {
    if (inView && userId) {
      const timer = setTimeout(() => {
        // Envoi automatique de la "Vue" sans clic
        fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: post.id,
            type: "VIEW",
            itemType: "POST"
          }),
        });
      }, 1000); // 1 seconde d'arrêt sur le post = Intérêt détecté

      return () => clearTimeout(timer);
    }
  }, [inView, userId, post.id]);

  return <div ref={ref}>{children}</div>;
}