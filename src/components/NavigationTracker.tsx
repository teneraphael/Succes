"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CURRENT = "dealcity:navigation:current";
const PREVIOUS = "dealcity:navigation:previous";

/** Conserve le dernier chemin interne pour les retours après un accès direct. */
export default function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const current = `${pathname}${window.location.search}`;
    try {
      const last = sessionStorage.getItem(CURRENT);
      if (last && last !== current) sessionStorage.setItem(PREVIOUS, last);
      sessionStorage.setItem(CURRENT, current);
    } catch {
      // La navigation reste disponible même si le stockage est désactivé.
    }
  }, [pathname]);

  return null;
}
