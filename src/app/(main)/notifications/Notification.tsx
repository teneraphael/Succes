import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  // Map des configurations d'icônes, messages et styles type écusson marketplace
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; bg: string; href: string }
  > = {
    FOLLOW: {
      message: "a rejoint ta vitrine",
      icon: <User2 className="size-3.5 text-sky-600" />,
      bg: "bg-sky-500/[0.05] border-sky-500/10",
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: "a laissé un avis sur ton article",
      icon: <MessageCircle className="size-3.5 text-amber-600 fill-amber-500/10" />,
      bg: "bg-amber-500/[0.05] border-amber-500/10",
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: "a aimé ta création",
      icon: <Heart className="size-3.5 text-rose-600 fill-rose-600/10" />,
      bg: "bg-rose-500/[0.05] border-rose-500/10",
      href: `/posts/${notification.postId}`,
    },
    // Ajout d'un type Marketplace si jamais tu l'utilises ou pour ton futur système de commande
    // @ts-ignore (Au cas où il n'est pas encore dans ton enum Prisma)
    ORDER: {
      message: "a validé un achat avec toi !",
      icon: <ShoppingBag className="size-3.5 text-emerald-600 fill-emerald-600/10" />,
      bg: "bg-emerald-500/[0.05] border-emerald-500/10",
      href: `/posts/${notification.postId}`,
    },
    REPORT_DELETION: {
      message: "Un article non conforme a été supprimé",
      icon: <User2 className="size-3.5 text-muted-foreground" />,
      bg: "bg-muted",
      href: "#",
    },
  };

  const config = notificationTypeMap[notification.type];

  // Sécurité si le type de notification n'est pas géré ou vide
  if (!config || notification.type === "REPORT_DELETION") {
    return null; 
  }

  return (
    <Link href={config.href} className="block group">
      <article
        className={cn(
          "flex items-start gap-4 p-4 lg:p-5 transition-colors border-b border-border/40 bg-white dark:bg-card hover:bg-muted/[0.02]",
          !notification.read && "bg-amber-500/[0.01]",
        )}
      >
        {/* AVATAR + ÉCUSSON S'INSPIRANT DE L'ARTISANAT DU PROFIL */}
        <div className="relative shrink-0">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={40} />
          {/* Le mini badge sculpté incrusté en bas à droite de l'avatar */}
          <div className={cn("absolute -bottom-1 -right-1 p-1 rounded-lg border shadow-sm flex items-center justify-center", config.bg)}>
            {config.icon}
          </div>
        </div>

        {/* LOGIQUE DE TEXTE HORIZONTALE ÉLÉGANTE */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="text-sm text-foreground/90 leading-tight">
            <span className="font-bold text-foreground group-hover:text-amber-600 transition-colors">
              {notification.issuer.displayName}
            </span>{" "}
            <span className="text-muted-foreground font-medium font-sans">{config.message}</span>
          </div>

          {/* APERÇU DU POST ENCADRÉ STYLE FICHE PRODUIT */}
          {notification.post && (
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground line-clamp-2 whitespace-pre-line group-hover:text-foreground transition-colors max-w-2xl font-sans leading-relaxed">
              {notification.post.content}
            </div>
          )}
        </div>

        {/* POINT DE NOTIFICATION DISCRET NON LUE */}
        {!notification.read && (
          <span className="size-2 rounded-full bg-amber-600 shrink-0 mt-2 animate-pulse" />
        )}
      </article>
    </Link>
  );
}