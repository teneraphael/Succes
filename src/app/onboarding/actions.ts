"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function saveUserLocation(city: string, neighborhood?: string) {
  const { user } = await validateRequest();
  const cookieStore = await cookies();

  // 1. Toujours enregistrer dans les cookies (nécessaire pour les visiteurs et la rapidité d'affichage)
  cookieStore.set("user_city", city, { path: "/", maxAge: 31536000 });
  if (neighborhood) {
    cookieStore.set("user_neighborhood", neighborhood, { path: "/", maxAge: 31536000 });
  } else {
    cookieStore.delete("user_neighborhood");
  }

  // 2. Si l'utilisateur est connecté, on met aussi à jour sa ligne en base de données !
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        city: city,
        neighborhood: neighborhood || null,
      },
    });
  }

  return { success: true };
}

export async function skipUserLocation() {
  const cookieStore = await cookies();
  // Cookie de saut valable 1 jour pour ne plus l'embêter s'il clique sur "Passer"
  cookieStore.set("skip_location_onboarding", "true", { path: "/", maxAge: 86400 });
  return { success: true };
}