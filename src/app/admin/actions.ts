"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function createSellerDirectly(formData: FormData) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.id !== "dgd2ohqrx3tqezng") {
      return { success: false, error: "Accès refusé : réservé à l'administrateur." };
    }

    // 1. Récupération des données du formulaire
    const shopName = formData.get("businessName") as string;
    const businessDomain = formData.get("businessDomain") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const city = formData.get("city") as string;
    const neighborhood = formData.get("neighborhood") as string;

    if (!shopName || !phoneNumber || !city || !neighborhood) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
    }

    // 2. Génération des accès
    const usernameBase = shopName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${usernameBase}_${randomSuffix}`;
    const tempPassword = `dealcity${randomSuffix}`;

    // 3. Hachage sécurisé natif
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(tempPassword, salt, 64).toString("hex");
    const hashedPass = `${salt}:${derivedKey}`;

    // 4. Création de l'utilisateur avec tous les flags requis
    const newSeller = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        username: username.trim(),
        displayName: shopName.trim(),
        businessName: shopName.trim(),
        passwordHash: hashedPass, // Utilisation correcte de passwordHash
        isSeller: true,          // Active le rôle vendeur
        isPioneer: true,         // 👈 Indispensable pour l'espace pionnier et le selecteur
        isVerified: true,        // 👈 Assure la visibilité du profil
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        businessDomain: businessDomain ? businessDomain.trim() : null,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isSeller: true,
        isPioneer: true,
      },
    });

    return { 
      success: true, 
      seller: newSeller, 
      tempPassword: tempPassword 
    };

  } catch (error: any) {
    console.error("Erreur création vendeur:", error);
    return { 
      success: false, 
      error: error.message || "Erreur serveur lors de la création du vendeur." 
    };
  }
}