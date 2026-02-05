"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SidebarVendeur from "@/app/(main)/seller/SidebarVendeur";

export default function LayoutClientWrapper({ children, navbar, menuBar, mobileMenu }: any) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/messages");
  // Nouvelle détection pour l'espace vendeur
  const isSellerPage = pathname.startsWith("/seller");

  return (
    <div className={cn(
      "flex w-full flex-col",
      isChatPage ? "h-[100dvh] overflow-hidden" : "min-h-screen"
    )}>
      
      {!isChatPage && navbar}

      <div className={cn(
        "flex w-full grow min-h-0",
        isChatPage 
          ? "max-w-none p-0 m-0 h-full" 
          : isSellerPage
            ? "max-w-[1600px] mx-auto p-0 md:p-5 gap-5" // On élargit pour le dashboard
            : "mx-auto max-w-7xl p-0 md:p-5 gap-5" 
      )}>
        
        {!isChatPage && (
          <div className="hidden md:block">
            {/* SWITCHER : Si URL /seller, on affiche SidebarVendeur, sinon le menuBar normal */}
            {isSellerPage ? (
              <SidebarVendeur className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
            ) : (
              menuBar
            )}
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