"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton({
  initialState,
}: NotificationsButtonProps) {
  const { user } = useSession();

  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000, // Rafraîchissement automatique toutes les 60 secondes
    enabled: !!user, // ✅ Évite les appels API inutiles si le visiteur n'est pas connecté
  });

  // Nombre de notifications non lues (0 si l'utilisateur n'est pas connecté)
  const unreadCount = user ? data.unreadCount : 0;
  const href = user ? "/notifications" : "/login?redirectTo=/notifications";

  return (
    <Link
      href={href}
      title="Notifications"
      className="flex items-center justify-start gap-3 px-2 py-2 rounded-xl transition-all hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2] active:scale-95 group"
    >
      {/* Icône cloche avec badge de compteur incrémenté */}
      <div className="relative">
        <Bell className="size-5 transition-transform group-hover:rotate-12 duration-200 shrink-0" />
        
        {/* ✅ BADGE ROUGE ULTRA VISIBLE S'IL Y A DES NOTIFICATIONS NON LUES */}
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black tabular-nums rounded-full flex items-center justify-center border-2 border-background shadow-sm animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Label visible uniquement sur les grands écrans (PC) */}
      <span className="hidden lg:inline text-sm font-black uppercase tracking-tight transition-colors">
        Notifications
      </span>
    </Link>
  );
}