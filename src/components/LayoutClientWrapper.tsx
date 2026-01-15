"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LayoutClientWrapper({ children, navbar, menuBar, mobileMenu }: any) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/messages");

  return (
    <div className={cn(
      "flex w-full flex-col",
      isChatPage ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      
      {/* Navbar : on la garde sur Home, mais elle doit être responsive */}
      {!isChatPage && navbar}

      <div className={cn(
        "flex w-full grow", 
        // MODIFICATION ICI : 
        // Sur mobile (max-md), on met p-0 et max-w-none pour tout le site
        isChatPage 
          ? "max-w-none p-0 m-0 overflow-hidden" 
          : "mx-auto max-w-7xl p-0 md:p-5 gap-0 md:gap-5" 
      )}>
        
        {/* Menu latéral caché sur mobile */}
        {!isChatPage && (
          <div className="hidden md:block">
            {menuBar}
          </div>
        )}
        
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