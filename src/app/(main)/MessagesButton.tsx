"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { user } = useSession();
  const { t } = useLanguage();

  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
    // ✅ Requête désactivée si non connecté
    enabled: !!user,
  });

  const unreadCount = user ? data.unreadCount : 0;
  const href = user ? "/messages" : "/login?redirectTo=/messages";

  return (
    <Link
      href={href}
      title="Messages"
      className="flex items-center justify-start gap-3 px-2 py-2 rounded-xl transition-all hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2] group"
    >
      {/* ✅ Icône mail avec badge non lu */}
      <div className="relative">
        <Mail className="size-5 transition-colors shrink-0" />
        {!!unreadCount && (
          <span className="absolute -right-1.5 -top-1.5 min-w-[18px] h-[18px] rounded-full bg-[#4a90e2] px-1 text-[9px] font-black tabular-nums text-white border-2 border-card flex items-center justify-center animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* ✅ Label visible uniquement sur desktop */}
      <span className="hidden lg:inline text-sm font-black uppercase tracking-tight transition-colors">
        Messages
      </span>
    </Link>
  );
}