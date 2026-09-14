"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  trackInteraction,
} from "@/lib/track-interaction";

type UseTrackPostOptions = {
  postId: string;

  source?: string;

  /**
   * Pourcentage minimum visible.
   */
  threshold?: number;

  /**
   * Nombre de secondes avant
   * de considérer que le post
   * a réellement été regardé.
   */
  minimumViewDuration?: number;
};

export function useTrackPost({
  postId,
  source = "for-you",
  threshold = 0.6,
  minimumViewDuration = 3,
}: UseTrackPostOptions) {
  const elementRef =
    useRef<HTMLDivElement | null>(null);

  const visibleSince =
    useRef<number | null>(null);

  const impressionTracked =
    useRef(false);

  const viewTracked =
    useRef(false);

  const [isVisible, setIsVisible] =
    useState(false);

  /**
   * IMPRESSION
   *
   * Le post est affiché à l'écran.
   */
  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          const currentlyVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >= threshold;

          setIsVisible(currentlyVisible);

          if (
            currentlyVisible &&
            !impressionTracked.current
          ) {
            impressionTracked.current = true;

            trackInteraction({
              postId,
              type: "IMPRESSION",

              metadata: {
                source,
              },
            });
          }

          /**
           * Début de visualisation
           */
          if (
            currentlyVisible &&
            visibleSince.current === null
          ) {
            visibleSince.current =
              Date.now();
          }

          /**
           * L'utilisateur quitte le post.
           */
          if (
            !currentlyVisible &&
            visibleSince.current !== null
          ) {
            const duration =
              (Date.now() -
                visibleSince.current) /
              1000;

            /**
             * VIEW seulement si le post
             * a été regardé suffisamment longtemps.
             */
            if (
              duration >= minimumViewDuration &&
              !viewTracked.current
            ) {
              viewTracked.current = true;

              trackInteraction({
                postId,
                type: "VIEW",

                duration: Math.round(duration),

                metadata: {
                  source,
                },
              });
            }

            visibleSince.current = null;
          }
        },

        {
          threshold: [
            0,
            threshold,
            1,
          ],
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };

  }, [
    postId,
    source,
    threshold,
    minimumViewDuration,
  ]);

  /**
   * Si l'utilisateur ferme l'application
   * pendant qu'il regarde le post.
   */
  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "hidden" &&
        visibleSince.current !== null &&
        !viewTracked.current
      ) {
        const duration =
          (Date.now() -
            visibleSince.current) /
          1000;

        if (
          duration >= minimumViewDuration
        ) {
          viewTracked.current = true;

          trackInteraction({
            postId,
            type: "VIEW",

            duration: Math.round(duration),

            metadata: {
              source,
            },
          });
        }
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };

  }, [
    postId,
    source,
    minimumViewDuration,
  ]);

  return {
    ref: elementRef,
    isVisible,
  };
}