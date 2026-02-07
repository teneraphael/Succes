"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
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
  const { user } = useSession(); // Récupère l'état de connexion

  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
    // IMPORTANT : On ne lance la requête que si l'utilisateur est connecté
    enabled: !!user, 
  });

  // Si pas de user, on affiche une icône simplifiée qui redirige vers le login
  const unreadCount = user ? data.unreadCount : 0;
  const href = user ? "/notifications" : "/login?redirectTo=/notifications";

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3 transition-all hover:bg-primary/10 group"
      title="Notifications"
      asChild
    >
      <Link href={href}>
        <div className="relative">
          <Bell className="group-hover:text-primary transition-colors" />
          {!!unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black tabular-nums text-primary-foreground border-2 border-background animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline font-medium group-hover:text-primary transition-colors">
          Notifications
        </span>
      </Link>
    </Button>
  );
}