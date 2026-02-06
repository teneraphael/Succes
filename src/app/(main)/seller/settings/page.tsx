import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma"; // Importe ton instance prisma
import { getUserDataSelect } from "@/lib/types";
import { redirect } from "next/navigation";
import SellerSettingsClient from "./SellerSettingsClient";

export default async function Page() {
  const { user: sessionUser } = await validateRequest();

  if (!sessionUser) {
    redirect("/login");
  }

  // REQUÊTE CRUCIALE : On récupère l'utilisateur avec toutes les propriétés du type UserData
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: getUserDataSelect(sessionUser.id), // C'est ici que la magie opère
  });

  if (!user) {
    redirect("/login");
  }

  // Maintenant, 'user' possède bien bio, allowNotifications, _count, etc.
  return <SellerSettingsClient user={user} />;
}