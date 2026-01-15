"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LayoutClientWrapper({ children, navbar, menuBar, mobileMenu }: any) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/messages");

  return (
    <div className={cn(
      "flex flex-col w-full",
      // On fixe la hauteur à l'écran UNIQUEMENT pour le chat
      isChatPage ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      {!isChatPage && navbar}

      <div className={cn(
        "flex w-full grow", 
        isChatPage 
          ? "max-w-none p-0 m-0 overflow-hidden" 
          : "mx-auto max-w-7xl p-5 gap-5" // Le style normal revient pour Home
      )}>
        {!isChatPage && menuBar}
        
        <main className={cn(
          "min-w-0 flex-1",
          isChatPage ? "h-full flex flex-col" : "w-full"
        )}>
          {children}
        </main>
      </div>

      {!isChatPage && mobileMenu}
    </div>
  );
}