"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, MessageSquare, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarVendeur({ className }: { className?: string }) {
  const pathname = usePathname();

  const menu = [
    { label: "Tableau de bord", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Mes Articles", href: "/seller/articles", icon: Package },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col w-full max-w-[280px] p-4 h-full bg-card", className)}>
      <h2 className="px-4 mb-6 text-xl font-black italic uppercase tracking-tighter text-primary">
        Seller Hub
      </h2>

      <nav className="flex-1 space-y-1.5">
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl font-bold transition-all",
                active ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="mt-auto flex items-center gap-3 p-3 rounded-2xl text-muted-foreground font-bold hover:bg-muted transition-all"
      >
        <ArrowLeft className="size-5" />
        <span className="text-sm">Retour</span>
      </Link>
    </div>
  );
}