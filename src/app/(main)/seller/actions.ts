"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * RÉCUPÉRER LE SOLDE DU VENDEUR
 */
export async function getSellerBalance() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    throw new Error("Non autorisé");
  }

  const user = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true },
  });

  // Retourne le solde ou 0 si l'utilisateur n'existe pas/n'a pas de solde
  return user?.balance ?? 0;
}

/**
 * DEMANDER UN RETRAIT VIA MONETBIL
 */
export async function requestWithdraw(amount: number) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Non autorisé");

  const seller = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true, phoneNumber: true },
  });

  if (!seller || (seller.balance ?? 0) < amount) {
    throw new Error("Solde insuffisant.");
  }

  if (!seller.phoneNumber) {
    throw new Error("Numéro de téléphone manquant dans votre profil.");
  }

  try {
    const response = await fetch("https://api.monetbil.com/payout/v1/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: process.env.MONETBIL_SERVICE_KEY,
        phonenumber: seller.phoneNumber.replace(/\D/g, ''), // Nettoie le numéro (garde juste les chiffres)
        amount: amount,
      }),
    });

    const data = await response.json();

    if (data.status === "success" || data.status === "REQUEST_ACCEPTED") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: loggedInUser.id },
          data: { balance: { decrement: amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: loggedInUser.id,
            amount: -amount,
            reason: `WITHDRAWAL_PENDING`,
          },
        }),
      ]);

      revalidatePath("/seller/dashboard");
      return { success: true };
    } else {
      throw new Error(data.message || "Erreur lors du transfert.");
    }
  } catch (error: any) {
    throw new Error(error.message || "Erreur de connexion à Monetbil.");
  }
}