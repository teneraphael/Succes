"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LayoutClientWrapper({ children, navbar, menuBar, mobileMenu }: any) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/messages");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {!isChatPage && navbar}

      <div className={cn(
        "flex w-full grow overflow-hidden", 
        isChatPage ? "max-w-none p-0 m-0" : "mx-auto max-w-7xl p-5 gap-5"
      )}>
        {!isChatPage && menuBar}
        
        <main className="flex flex-1 flex-col min-w-0 h-full">
          {children}
        </main>
      </div>

      {!isChatPage && mobileMenu}
    </div>
  );
}