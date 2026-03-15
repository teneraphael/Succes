"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function submitOrder(formData: FormData, cartItems: any[]) {
  const { user } = await validateRequest();
  
  const customerName = formData.get('name') as string;
  const customerPhone = formData.get('phone') as string;
  const customerAddress = formData.get('address') as string;

  // 1. Enregistrement en base de données
  try {
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        userId: user?.id || null, // Optionnel si l'user est connecté
        total: cartItems.reduce((acc, item) => acc + item.price, 0),
        items: {
          create: cartItems.map(item => ({
            productId: item.id,
            price: item.price,
          }))
        }
      }
    });

    // 2. LOGIQUE DE NOTIFICATION
    // Tu peux ajouter ici un envoi d'email ou un message Telegram/Discord
    console.log(`🚀 Nouvelle commande DealCity #${order.id} !`);
    console.log(`Client: ${customerName} (${customerPhone})`);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erreur commande:", error);
    return { success: false };
  }
}