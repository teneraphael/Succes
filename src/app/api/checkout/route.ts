import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Vérification de l'acheteur
    const { user: buyer } = await validateRequest();
    if (!buyer) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, price, name, phone, address, note } = body;

    // 2. Récupération des infos du produit (Vendeur)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true } 
    });

    if (!post) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // 3. Calculs financiers (Commission 5%)
    const totalAmount = typeof price === 'string' ? parseInt(price) : price;
    const commission = Math.round(totalAmount * 0.05); 
    const sellerEarnings = totalAmount - commission;

    // 4. Création de la commande en mode "Cash On Delivery"
    const order = await prisma.order.create({
      data: {
        userId: buyer.id,
        sellerId: post.userId,
        postId: postId,
        totalAmount: totalAmount,
        total: totalAmount,
        commission: commission,
        sellerEarnings: sellerEarnings,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        notes: note || "", 
        status: "PENDING", // Statut visible directement par le livreur
      },
    });

    // 5. Réponse de succès (Fin du tunnel sans Monetbil)
    return NextResponse.json({ 
      success: true, 
      orderId: order.id 
    });

  } catch (error: any) {
    console.error("Checkout Error (COD):", error);
    return NextResponse.json({ error: "Erreur lors de la commande" }, { status: 500 });
  }
}