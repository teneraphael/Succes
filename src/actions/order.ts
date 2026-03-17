"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function submitOrder(formData: FormData, cartItems: any[]) {
  const { user } = await validateRequest();
  
  // Sécurité : Si l'utilisateur n'est pas connecté, on arrête tout 
  // car Prisma exige un 'user' selon ton erreur.
  if (!user) {
    return { success: false, error: "Vous devez être connecté pour commander." };
  }

  const customerName = formData.get('name') as string;
  const customerPhone = formData.get('phone') as string;
  const customerAddress = formData.get('address') as string;

  const calculatedTotal = cartItems.reduce((acc, item) => {
    return acc + (Number(item.price) * (Number(item.quantity) || 1));
  }, 0);

  const commission = calculatedTotal * 0.1; 
  const sellerEarnings = calculatedTotal - commission;

  try {
    const firstItem = cartItems[0];

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        status: "PENDING",
        total: calculatedTotal,
        totalAmount: calculatedTotal,
        commission: commission,
        sellerEarnings: sellerEarnings,
        
        // On connecte l'utilisateur (obligatoire ici)
        user: {
          connect: { id: user.id }
        },
        
        // Relations vers le vendeur et le post
        seller: {
          connect: { id: firstItem.sellerId } 
        },
        post: {
          connect: { id: firstItem.id } 
        },

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

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erreur Prisma finale:", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}