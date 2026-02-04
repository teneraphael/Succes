import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home, Video, PlusSquare, Store } from "lucide-react"; 
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
      {/* ACCUEIL */}
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

      {/* BOUTON DYNAMIQUE : PUBLIER OU DEVENIR VENDEUR */}
      {user.isSeller ? (
        // Si l'utilisateur est déjà vendeur, on montre le bouton pour poster
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-primary"
          title="Publier une annonce"
          asChild
        >
          <Link href="/post/new">
            <PlusSquare className="size-5" />
            <span className="hidden lg:inline font-bold">Publier</span>
          </Link>
        </Button>
      ) : (
        // Si l'utilisateur n'est pas vendeur, on montre le bouton pour le devenir
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-amber-600"
          title="Devenir vendeur"
          asChild
        >
          <Link href="/become-seller"> {/* Ajuste ce lien vers ta page de formulaire vendeur */}
            <Store className="size-5" />
            <span className="hidden lg:inline">Vendre</span>
          </Link>
        </Button>
      )}

      {/* VIDÉOS */}
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

      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />

      {/* FAVORIS */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark className="size-5" />
          <span className="hidden lg:inline">Favoris</span>
        </Link>
      </Button>
    </div>
  );
}