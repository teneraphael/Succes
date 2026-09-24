"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
  overlay?: boolean;
}

export default function BackButton({ fallback = "/", label = "Retour", className = "", overlay = false }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  function goBack() {
    let previous: string | null = null;
    try {
      previous = sessionStorage.getItem("dealcity:navigation:previous");
    } catch {}

    // Le retour navigateur garde la recherche, le défilement et les pages déjà chargées.
    if (previous && previous.startsWith("/") && !previous.startsWith("//") &&
        previous.split("?")[0] !== pathname && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button type="button" onClick={goBack} aria-label={label}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${overlay
        ? "border-white/30 bg-zinc-950/80 text-white hover:bg-zinc-950 focus-visible:ring-white"
        : "border-border/60 bg-card text-foreground hover:bg-muted focus-visible:ring-primary"} ${className}`}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
