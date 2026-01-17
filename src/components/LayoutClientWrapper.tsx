"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LayoutClientWrapper({ children, navbar, menuBar, mobileMenu }: any) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/messages");

  return (
    <div className={cn(
      "flex w-full flex-col",
      // Sur mobile, 100dvh est plus précis que h-screen
      isChatPage ? "h-[100dvh] overflow-hidden" : "min-h-screen"
    )}>
      
      {!isChatPage && navbar}

      <div className={cn(
        "flex w-full grow min-h-0", // min-h-0 est vital pour le scroll flex
        isChatPage 
          ? "max-w-none p-0 m-0 h-full" 
          : "mx-auto max-w-7xl p-0 md:p-5 gap-5" 
      )}>
        
        {!isChatPage && (
          <div className="hidden md:block">
            {menuBar}
          </div>
        )}
        
        <main className={cn(
          "min-w-0 flex-1",
          isChatPage ? "h-full w-full flex flex-col" : "w-full"
        )}>
          {children}
        </main>
      </div>

      {!isChatPage && mobileMenu}
    </div>
  );
}