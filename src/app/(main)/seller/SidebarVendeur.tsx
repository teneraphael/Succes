"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, MessageSquare, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarVendeurProps {
  className?: string;
}

export default function SidebarVendeur({ className }: SidebarVendeurProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Tableau de bord", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Mes Articles", href: "/seller/articles", icon: Package },
    { label: "Messages Clients", href: "/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/seller/settings", icon: Settings },
  ];

  return (
    /* On force une largeur maximale ici pour stabiliser le menu */
    <div className={cn("flex flex-col w-full max-w-[280px]", className)}>
      <div className="px-3 py-2">
        <h2 className="mb-4 px-4 text-lg font-black tracking-tighter text-primary uppercase italic">
          Espace Vendeur
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 rounded-xl transition-all duration-200",
                pathname === item.href 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm" 
                  : "hover:bg-muted"
              )}
            >
              <Link href={item.href}>
                <item.icon className={cn("size-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("font-bold text-sm", pathname === item.href ? "text-primary" : "text-foreground")}>
                  {item.label}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 px-3 py-2 border-t border-border/50 pt-4">
        <Button variant="ghost" asChild className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Retour au fil</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}