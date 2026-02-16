"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia } from "@/auth";

export async function deleteAccount() {
  const { user, session } = await validateRequest();

  if (!session) {
    throw new Error("Non autorisé");
  }

  // 1. Supprimer de la DB (Prisma supprimera les relations si 'onDelete: Cascade' est mis)
  await prisma.user.delete({
    where: { id: user.id },
  });

  // 2. Invalider la session Lucia
  await lucia.invalidateSession(session.id);

  // 3. Supprimer le cookie
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/login");
}