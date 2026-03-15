"use client";

import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  ArrowLeft, 
  Settings, 
  Wallet 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarVendeur({ className }: { className?: string }) {
  const pathname = usePathname();

  const menu = [
    { label: "Tableau de bord", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Mes Articles", href: "/seller/articles", icon: Package },
    { label: "Mes Retraits", href: "/seller/withdrawals", icon: Wallet }, // ⬅️ Nouvel onglet
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col w-full max-w-[280px] p-4 h-full bg-card border-r border-black/5", className)}>
      <h2 className="px-4 mb-8 text-xl font-black italic uppercase tracking-tighter text-primary">
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
                "flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all",
                active 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-5 shrink-0", active ? "text-white" : "text-zinc-400")} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {active && (
                <div className="ml-auto size-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-black/5">
        <Link
          href="/"
          className="flex items-center gap-3 p-3.5 rounded-2xl text-muted-foreground font-bold hover:bg-zinc-100 transition-all group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour au flux</span>
        </Link>
      </div>
    </div>
  );
}