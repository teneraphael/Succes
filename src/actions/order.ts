"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitOrder(formData: FormData, cartItems: any[]) {
  const { user: loggedInUser } = await validateRequest();
  
  // 1. SÉCURITÉ : L'utilisateur doit être identifié
  if (!loggedInUser) {
    return { success: false, error: "Veuillez vous connecter pour passer commande." };
  }

  // 2. RÉCUPÉRATION DES INFOS DE LIVRAISON (CASH)
  const customerName = formData.get('name') as string;
  const customerPhone = formData.get('phone') as string;
  const customerAddress = formData.get('address') as string; // Exemple: "Bonabéri, face collège Polyvalent"

  if (!customerPhone || !customerAddress) {
    return { success: false, error: "Le téléphone et l'adresse sont obligatoires." };
  }

  // 3. CALCUL DES MONTANTS
  const calculatedTotal = cartItems.reduce((acc, item) => {
    return acc + (Number(item.price) * (Number(item.quantity) || 1));
  }, 0);

  // Pour le paiement à la livraison, la commission est indicative 
  // car l'argent ne passe plus par ton compte Monetbil.
  const commission = calculatedTotal * 0.1; 
  const sellerEarnings = calculatedTotal - commission;

  try {
    const firstItem = cartItems[0];

    // 4. CRÉATION DE LA COMMANDE DANS PRISMA
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        status: "PENDING", // Reste en PENDING tant que le vendeur n'a pas livré
        totalAmount: calculatedTotal,
        commission: commission,
        sellerEarnings: sellerEarnings,
        paymentMethod: "CASH_ON_DELIVERY", // On marque bien que c'est du Cash
        
        // Connexion à l'acheteur
        user: {
          connect: { id: loggedInUser.id }
        },
        
        // Connexion au vendeur (le propriétaire de l'annonce)
        seller: {
          connect: { id: firstItem.sellerId } 
        },
        
        // Connexion au post principal
        post: {
          connect: { id: firstItem.id } 
        },

        // Création des lignes de produits
        items: {
          create: cartItems.map(item => ({
            productId: String(item.id),
            price: Number(item.price),
            quantity: Number(item.quantity) || 1,
            color: item.color ?? null, 
          }))
        }
      }
    });

    // 5. RAFRAÎCHISSEMENT DU CACHE
    revalidatePath("/orders");
    revalidatePath("/seller/dashboard");

    return { 
      success: true, 
      orderId: order.id,
      message: "Commande enregistrée ! Le vendeur va vous contacter pour la livraison." 
    };

  } catch (error: any) {
    console.error("Erreur commande Cash:", error.message);
    return { success: false, error: "Impossible d'enregistrer la commande. Réessayez." };
  }
}