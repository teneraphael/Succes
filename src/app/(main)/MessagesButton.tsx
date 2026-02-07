"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { user } = useSession(); // On récupère l'utilisateur pour vérifier la connexion

  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
    // Désactive la requête API si l'utilisateur est un visiteur anonyme
    enabled: !!user,
  });

  // Gestion dynamique du lien et du compteur
  const unreadCount = user ? data.unreadCount : 0;
  const href = user ? "/messages" : "/login?redirectTo=/messages";

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3 transition-all hover:bg-primary/10 group"
      title="Messages"
      asChild
    >
      <Link href={href}>
        <div className="relative">
          <Mail className="group-hover:text-primary transition-colors" />
          {!!unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black tabular-nums text-primary-foreground border-2 border-background animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline font-medium group-hover:text-primary transition-colors">
          Messages
        </span>
      </Link>
    </Button>
  );
}