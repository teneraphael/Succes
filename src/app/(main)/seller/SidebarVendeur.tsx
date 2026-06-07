"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ArrowLeft,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export default function SidebarVendeur({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // ✅ Menu traduit dynamiquement
  const menu = [
    { label: t.seller_dashboard, href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Mes Articles", href: "/seller/articles", icon: Package },
    { label: "Mes Retraits", href: "/seller/withdrawals", icon: Wallet },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: t.settings, href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col w-full max-w-[280px] p-4 h-full bg-card border-r border-border/40", className)}>

      {/* ✅ Logo Seller Hub — style DealCity */}
      <div className="px-2 mb-8 flex items-center gap-2">
        <div className="flex items-end gap-[3px]">
          <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-6 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
        </div>
        <h2 className="text-lg font-black italic uppercase tracking-tighter text-[#6ab344]">
          Seller Hub
        </h2>
      </div>

      {/* ✅ Navigation */}
      <nav className="flex-1 space-y-1.5">
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all",
                active
                  ? "bg-[#4a90e2] text-white shadow-lg shadow-[#4a90e2]/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-[#4a90e2]/8 hover:text-[#4a90e2]"
              )}
            >
              <item.icon className={cn(
                "size-5 shrink-0",
                active ? "text-white" : "text-muted-foreground"
              )} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {active && (
                <div className="ml-auto size-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ✅ Retour au flux traduit */}
      <div className="mt-auto pt-6 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-3 p-3.5 rounded-2xl text-muted-foreground font-bold hover:bg-[#4a90e2]/8 hover:text-[#4a90e2] transition-all group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">{t.home}</span>
        </Link>
      </div>
    </div>
  );
}