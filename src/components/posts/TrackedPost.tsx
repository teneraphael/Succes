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

  useEffect(() => {
    // Si l'élément n'est pas en vue ou si l'utilisateur n'est pas loggé, on ignore
    if (!inView || !userId || hasTracked.current) return;

    const timer = setTimeout(async () => {
      // Sécurité : on marque avant l'appel pour éviter les doublons même en cas de latence
      hasTracked.current = true;

      try {
        const response = await fetch("/api/posts/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: post.id,
            type: "VIEW",
            itemType: "POST"
          }),
        });

        // Si l'API renvoie une erreur (ex: 500), on ne veut pas bloquer l'UI.
        // On logue discrètement pour le debug.
        if (!response.ok) {
          console.warn(`Tracking non critique échoué pour le post ${post.id}`);
        }
      } catch (error) {
        // En cas d'erreur réseau (ex: CORS ou timeout), on ne fait rien
        // pour ne pas interrompre l'expérience utilisateur.
        console.warn("Tracking network error, ignoring.");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inView, userId, post.id]);

  return <div ref={ref} className="w-full">{children}</div>;
}