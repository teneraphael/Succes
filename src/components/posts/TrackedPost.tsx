"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface TrackedPostProps {
  post: any;
  userId?: string;
  children: React.ReactNode;
}

export default function TrackedPost({ post, userId, children }: TrackedPostProps) {
  // On utilise un useRef pour suivre si l'interaction a déjà été envoyée au serveur
  // pour cette instance précise, afin d'éviter les doubles appels lors de re-renders.
  const hasTracked = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0.7, // 70% de visibilité pour confirmer l'intérêt
    triggerOnce: true, // L'observateur s'arrête après la première détection
  });

  useEffect(() => {
    // On ne lance le timer que si le post est visible, l'user connecté, 
    // et qu'on n'a pas encore tracké ce post.
    if (inView && userId && !hasTracked.current) {
      const timer = setTimeout(async () => {
        try {
          // On marque immédiatement comme tracké pour bloquer tout autre appel
          hasTracked.current = true;

          await fetch("/api/posts/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: post.id,
              type: "VIEW",
              itemType: "POST"
            }),
            // Indique au navigateur que cette requête ne doit pas bloquer 
            // ou rafraîchir l'interface utilisateur inutilement
            priority: "low" 
          });
        } catch (error) {
          console.error("Erreur de tracking DealCity:", error);
          // En cas d'échec, on permet une nouvelle tentative au prochain scroll
          hasTracked.current = false;
        }
      }, 1000); // 1 seconde de focus = intérêt réel

      return () => clearTimeout(timer);
    }
  }, [inView, userId, post.id]);

  return <div ref={ref}>{children}</div>;
}