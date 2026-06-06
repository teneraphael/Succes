import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface NotificationProps {
  notification: NotificationData;
}

type NotificationConfig = {
  message: string;
  icon: JSX.Element;
  iconBg: string;
  dot: string;
  href: string;
};

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Partial<Record<NotificationType, NotificationConfig>> & {
    [key: string]: NotificationConfig;
  } = {
    FOLLOW: {
      message: "a rejoint ta vitrine",
      icon: <User2 className="size-3.5 text-[#4a90e2]" />,
      iconBg: "bg-[#4a90e2]/10 border-[#4a90e2]/20",
      dot: "bg-[#4a90e2]",
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: "a laissé un avis sur ton article",
      icon: <MessageCircle className="size-3.5 text-amber-500" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-500",
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: "a aimé ta création",
      icon: <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />,
      iconBg: "bg-rose-500/10 border-rose-500/20",
      dot: "bg-rose-500",
      href: `/posts/${notification.postId}`,
    },
    ORDER: {
      message: "a validé un achat avec toi !",
      icon: <ShoppingBag className="size-3.5 text-[#6ab344]" />,
      iconBg: "bg-[#6ab344]/10 border-[#6ab344]/20",
      dot: "bg-[#6ab344]",
      href: `/posts/${notification.postId}`,
    },
    REPORT_DELETION: {
      message: "Un article non conforme a été supprimé",
      icon: <User2 className="size-3.5 text-muted-foreground" />,
      iconBg: "bg-muted border-border",
      dot: "bg-muted-foreground",
      href: "#",
    },
  };

  const config = notificationTypeMap[notification.type];

  if (!config || notification.type === "REPORT_DELETION") return null;

  return (
    <Link href={config.href} className="block group">
      <article
        className={cn(
          "flex items-start gap-3 px-4 py-4 transition-all border-b border-border/40",
          "hover:bg-[#4a90e2]/[0.02] dark:hover:bg-[#4a90e2]/[0.04]",
          !notification.read && "bg-[#4a90e2]/[0.03] dark:bg-[#4a90e2]/[0.05]",
        )}
      >
        {/* Avatar + badge */}
        <div className="relative shrink-0">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={42} />
          <div
            className={cn(
              "absolute -bottom-1 -right-1 p-[5px] rounded-lg border shadow-sm flex items-center justify-center",
              config.iconBg,
            )}
          >
            {config.icon}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 space-y-2 pt-0.5">
          <p className="text-sm leading-snug">
            <span className="font-black text-foreground group-hover:text-[#4a90e2] transition-colors">
              {notification.issuer.displayName}
            </span>{" "}
            <span className="text-muted-foreground font-medium">
              {config.message}
            </span>
          </p>

          {notification.post && (
            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed group-hover:border-[#4a90e2]/20 transition-colors">
              {notification.post.content.slice(0, 120)}
              {notification.post.content.length > 120 && "..."}
            </div>
          )}
        </div>

        {!notification.read && (
          <div className="shrink-0 mt-1.5">
            <span className={cn("block size-2 rounded-full animate-pulse", config.dot)} />
          </div>
        )}
      </article>
    </Link>
  );
}