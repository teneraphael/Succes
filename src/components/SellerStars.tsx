"use client";

import { getSellerStars } from "@/lib/badge";

interface SellerStarsProps {
  followerCount: number;
  size?: "sm" | "md";
}

export default function SellerStars({ followerCount, size = "sm" }: SellerStarsProps) {
  const stars = getSellerStars(followerCount);
  const starSize = size === "sm" ? "size-3" : "size-4";

  return (
    <div className="flex items-center gap-0.5" title={`${stars} étoile${stars > 1 ? "s" : ""} · ${followerCount} abonnés`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`${starSize} transition-colors ${
            i < stars
              ? "text-amber-400"
              : "text-muted-foreground/15"
          }`}
          fill="currentColor"
        >
          <path d="M6 0.5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5 3.22 9.05l.53-3.09L1.5 3.77l3.11-.45L6 .5z"/>
        </svg>
      ))}
    </div>
  );
}