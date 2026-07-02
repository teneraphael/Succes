import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";

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

// Extraction propre pour isoler le nom du produit sans le texte brut
const extractProductName = (content: string | undefined) => {
  if (!content) return null;
  const productMatch = content.match(/\s*PRODUIT\s*:\s*(.*)/i);
  return productMatch ? productMatch[1].trim() : content.slice(0, 35) + "...";
};

export default function Notification({ notification }: NotificationProps) {
  const { t } = useLanguage();

  const notificationTypeMap: Partial<Record<NotificationType, NotificationConfig>> & {
    [key: string]: NotificationConfig;
  } = {
    FOLLOW: {
      message: t.joined_store,
      icon: <User2 className="size-3.5 text-[#4a90e2]" />,
      iconBg: "bg-[#4a90e2]/10 border-[#4a90e2]/20",
      dot: "bg-[#4a90e2]",
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: t.left_review,
      icon: <MessageCircle className="size-3.5 text-amber-500" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-500",
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: t.liked_creation,
      icon: <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />,
      iconBg: "bg-rose-500/10 border-rose-500/20",
      dot: "bg-rose-500",
      href: `/posts/${notification.postId}`,
    },
    ORDER: {
      message: t.validated_purchase,
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

  const productName = notification.post ? extractProductName(notification.post.content) : null;

  // Récupération blindée du premier média du post (gère majuscules/minuscules)
  const postWithAttachments = notification.post as any;
  const firstAttachment = postWithAttachments?.attachments?.find(
    (att: any) => att.type?.toUpperCase() === "IMAGE" || att.type?.toUpperCase() === "VIDEO"
  );

  return (
    <Link href={config.href} className="block group">
      <article
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-4 transition-all border-b border-border/40 bg-card",
          "hover:bg-[#4a90e2]/[0.02] dark:hover:bg-[#4a90e2]/[0.04]",
          !notification.read && "bg-[#4a90e2]/[0.03] dark:bg-[#4a90e2]/[0.05]",
        )}
      >
        {/* Gauche : Infos & Contenu textuel */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={42} />
            <div className={cn(
              "absolute -bottom-1 -right-1 p-[5px] rounded-lg border shadow-sm flex items-center justify-center",
              config.iconBg,
            )}>
              {config.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-0.5 space-y-0.5 text-left">
            <p className="text-sm leading-snug break-words text-muted-foreground font-medium">
              <span className="font-black text-foreground group-hover:text-[#4a90e2] transition-colors mr-1">
                {notification.issuer.displayName}
              </span>{" "}
              {config.message}
              {productName && (
                <>
                  {" "}<span className="font-black text-foreground uppercase">{productName}</span>
                </>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Droite : Miniature Produit ou Icône Contexte ou Point non lu */}
        <div className="flex items-center gap-3 shrink-0">
          {firstAttachment ? (
            <div className="relative size-12 rounded-xl overflow-hidden bg-muted border border-border/60 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              {firstAttachment.type?.toUpperCase() === "IMAGE" ? (
                <Image
                  src={firstAttachment.url}
                  alt="Miniature produit"
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized={firstAttachment.url.includes("ufs.sh") || firstAttachment.url.includes("utfs.io")}
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                  <video src={firstAttachment.url} className="w-full h-full object-cover aspect-square" muted />
                </div>
              )}
            </div>
          ) : (
            // Carton générique affiché uniquement si la notification est liée à un post (sans médias)
            notification.post && (
              <div className="size-12 rounded-xl bg-muted border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/40 text-xs font-bold select-none">
                📦
              </div>
            )
          )}

          {/* Point indicateur non lu */}
          {!notification.read && (
            <div className="w-2 flex justify-center">
              <span className={cn("block size-2 rounded-full animate-pulse", config.dot)} />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}