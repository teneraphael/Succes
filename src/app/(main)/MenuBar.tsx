import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Home, Video, PlusSquare, Store, LogIn } from "lucide-react"; 
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  // On initialise les compteurs à 0 par défaut pour les visiteurs
  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  // On ne fait les requêtes DB/Stream que si l'utilisateur est connecté
  if (user) {
    const [notifications, messages] = await Promise.all([
      prisma.notification.count({
        where: {
          recipientId: user.id,
          read: false,
        },
      }),
      streamServerClient.getUnreadCount(user.id).then(res => res.total_unread_count).catch(() => 0),
    ]);
    unreadNotificationsCount = notifications;
    unreadMessagesCount = messages;
  }

  return (
    <div className={className}>
      {/* 1. ACCUEIL - Toujours accessible */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 transition-all hover:bg-primary/10 group"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home className="size-5 group-hover:text-primary transition-colors" />
          <span className="hidden lg:inline font-medium group-hover:text-primary">Accueil</span>
        </Link>
      </Button>

      {/* 2. VIDÉOS - Toujours accessible */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 transition-all hover:bg-primary/10 group"
        title="Vidéos"
        asChild
      >
        <Link href="/video">
          <Video className="size-5 group-hover:text-primary transition-colors" />
          <span className="hidden lg:inline font-medium group-hover:text-primary">Vidéos</span>
        </Link>
      </Button>

      {/* 3. LE MILIEU : BOUTON DYNAMIQUE OU CONNEXION */}
      {!user ? (
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-[#4a90e2] animate-pulse"
          title="Se connecter"
          asChild
        >
          <Link href="/login">
            <LogIn className="size-6" />
            <span className="hidden lg:inline font-black uppercase italic tracking-tighter">Connexion</span>
          </Link>
        </Button>
      ) : user.isSeller ? (
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 text-primary"
          title="Publier une annonce"
          asChild
        >
          <Link href="/post/new">
            <PlusSquare className="size-6" />
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

      {/* 4. NOTIFICATIONS - Gère l'absence de user en interne */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      
      {/* 5. MESSAGES - Gère l'absence de user en interne */}
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
    </div>
  );
}