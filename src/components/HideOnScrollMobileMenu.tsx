"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function HideOnScrollMobileMenu({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex w-full justify-center border-t bg-card/95 backdrop-blur-md p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {children}
    </nav>
  );
}