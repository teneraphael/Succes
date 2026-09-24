"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { hash } from "@node-rs/argon2";
import { canCreateSeller } from "@/lib/seller-creator-access";

export async function createSellerDirectly(formData: FormData) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!canCreateSeller(loggedInUser?.id)) {
      return { success: false, error: "Accès refusé : compte non autorisé à créer des vendeurs." };
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

    // Même format de mot de passe que la connexion et l'inscription.
    const hashedPass = await hash(tempPassword, {
      memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1,
    });

    // 4. Création de l'utilisateur avec tous les flags requis
    const newSeller = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        username: username.trim(),
        displayName: shopName.trim(),
        businessName: shopName.trim(),
        passwordHash: hashedPass, // Utilisation correcte de passwordHash
        isSeller: true,          // Active le rôle vendeur
        isPioneer: true,         // 👈 Indispensable pour l'espace pionnier et le selecteur      // 👈 Assure la visibilité du profil
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
