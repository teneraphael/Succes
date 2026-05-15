import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Home, Video, PlusSquare, Store, LogIn } from "lucide-react"; 
import Link from "next/link";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  // On initialise les compteurs à 0 par défaut
  let unreadNotificationsCount = 0;

  // On ne fait la requête Prisma que si l'utilisateur est connecté
  if (user) {
    const notifications = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    });
    unreadNotificationsCount = notifications;
  }

  return (
    <div className={className}>
      {/* 1. ACCUEIL */}
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

      {/* 2. VIDÉOS */}
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

      {/* 4. NOTIFICATIONS */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
    </div>
  );
}