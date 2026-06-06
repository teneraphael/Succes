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
    refetchInterval: 60 * 1000,
    // ✅ Requête désactivée si non connecté — évite les appels API inutiles
    enabled: !!user,
  });

  // ✅ Compte à 0 si non connecté, redirige vers login si nécessaire
  const unreadCount = user ? data.unreadCount : 0;
  const href = user ? "/notifications" : "/login?redirectTo=/notifications";

  return (
    <Link
      href={href}
      title="Notifications"
      className="flex items-center justify-start gap-3 px-2 py-2 rounded-xl transition-all hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2] group"
    >
      {/* ✅ Icône cloche avec badge de compteur non lu */}
      <div className="relative">
        <Bell className="size-5 lg:size-5 transition-colors shrink-0" />
        {!!unreadCount && (
          <span className="absolute -right-1.5 -top-1.5 min-w-[18px] h-[18px] rounded-full bg-[#4a90e2] px-1 text-[9px] font-black tabular-nums text-white border-2 border-card flex items-center justify-center animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* ✅ Label visible uniquement sur desktop */}
      <span className="hidden lg:inline text-sm font-black uppercase tracking-tight transition-colors">
        Notifications
      </span>
    </Link>
  );
}