"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * RÉCUPÉRER LE SOLDE DU VENDEUR
 */
export async function getSellerBalance() {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return 0;

  const user = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true },
  });

  return user?.balance ?? 0;
}

/**
 * DEMANDER UN RETRAIT VIA MONETBIL
 */
export async function requestWithdraw(amount: number) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Session expirée. Veuillez vous reconnecter.");

  // 1. Vérifications de base et calcul des frais (ex: 2% de frais d'opérateur)
  const MIN_WITHDRAW = 500;
  if (amount < MIN_WITHDRAW) throw new Error(`Le montant minimum est de ${MIN_WITHDRAW} FCFA.`);

  const seller = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true, phoneNumber: true, displayName: true },
  });

  if (!seller || (seller.balance ?? 0) < amount) {
    throw new Error("Solde insuffisant pour cette opération.");
  }

  if (!seller.phoneNumber) {
    throw new Error("Veuillez configurer votre numéro de téléphone dans votre profil.");
  }

  // 2. Formatage du numéro pour Monetbil (237XXXXXXXXX)
  let phone = seller.phoneNumber.replace(/\D/g, '');
  if (phone.length === 9) phone = "237" + phone;

  try {
    // 3. Appel à l'API Payout de Monetbil
    const response = await fetch("https://api.monetbil.com/payout/v1/transfer", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MONETBIL_API_KEY}` // Assure-toi d'avoir cette clé
      },
      body: JSON.stringify({
        service: process.env.MONETBIL_SERVICE_KEY,
        phonenumber: phone,
        amount: amount,
      }),
    });

    const data = await response.json();

    // 4. Traitement du résultat
    // Monetbil renvoie souvent "REQUEST_ACCEPTED" pour les transferts asynchrones
    if (data.status === "success" || data.status === "REQUEST_ACCEPTED") {
      
      await prisma.$transaction([
        // Débit du solde
        prisma.user.update({
          where: { id: loggedInUser.id },
          data: { balance: { decrement: amount } },
        }),
        // Création de la trace avec le bon type
        prisma.transaction.create({
          data: {
            userId: loggedInUser.id,
            amount: -amount,
            reason: `Retrait Mobile Money (${phone})`,
            type: "WITHDRAW", // Corrigé (était BOOST)
            status: "SUCCESS",
          },
        }),
      ]);

      revalidatePath("/seller/dashboard");
      return { success: true };
    } else {
      // Message d'erreur spécifique de Monetbil
      throw new Error(data.message || "Le transfert a été rejeté par l'opérateur.");
    }
  } catch (error: any) {
    console.error("[WITHDRAW_ERROR]:", error);
    throw new Error(error.message || "Erreur de connexion avec le service de paiement.");
  }
}