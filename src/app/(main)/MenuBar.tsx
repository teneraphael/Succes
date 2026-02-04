import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Home, Video, PlusSquare, Store } from "lucide-react"; 
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      {/* 1. ACCUEIL */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home className="size-5" />
          <span className="hidden lg:inline">Accueil</span>
        </Link>
      </Button>

      {/* 2. VIDÉOS */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Vidéos"
        asChild
      >
        <Link href="/video">
          <Video className="size-5" />
          <span className="hidden lg:inline">Vidéos</span>
        </Link>
      </Button>

      {/* 3. LE MILIEU : BOUTON DYNAMIQUE (PUBLIER OU VENDEUR) */}
      {user.isSeller ? (
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-primary"
          title="Publier une annonce"
          asChild
        >
          <Link href="/post/new">
            <PlusSquare className="size-6" /> {/* Taille légèrement plus grande pour le centre */}
            <span className="hidden lg:inline font-bold">Publier</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-amber-600"
          title="Devenir vendeur"
          asChild
        >
          <Link href="/become-seller">
            <Store className="size-6" />
            <span className="hidden lg:inline font-bold">Vendre</span>
          </Link>
        </Button>
      )}

      {/* 4. NOTIFICATIONS */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      
      {/* 5. MESSAGES */}
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
    </div>
  );
}