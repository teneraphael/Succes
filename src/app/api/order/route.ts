import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Identification de l'acheteur (OBLIGATOIRE pour éviter l'erreur TypeScript sur userId)
    const { user: buyer } = await validateRequest();
    
    if (!buyer) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour passer une commande." }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      items, 
      total, 
      postId, 
      note 
    } = body;

    // 2. Validation du panier
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Votre panier est vide" }, { status: 400 });
    }

    // 3. RÉCUPÉRATION DU VENDEUR (Via le produit)
    const targetPostId = postId || items[0].id;
    const post = await prisma.post.findUnique({
      where: { id: targetPostId },
      select: { userId: true } 
    });

    if (!post) {
      return NextResponse.json({ error: "Le produit n'existe plus." }, { status: 404 });
    }

    // 4. CALCULS FINANCIERS (Commission 5%)
    const amount = Number(total);
    const commission = Math.round(amount * 0.05); 
    const sellerEarnings = amount - commission;

    // 5. CRÉATION DE LA COMMANDE (Paiement à la livraison)
    const order = await prisma.order.create({
      data: {
        customerName: customerName || "Anonyme",
        customerPhone: customerPhone || "",
        // Utilise ?? undefined pour les champs optionnels en DB
        customerAddress: customerAddress ?? undefined,
        notes: note || "",
        totalAmount: amount,
        total: amount,
        commission: commission,
        sellerEarnings: sellerEarnings,
        status: "PENDING", // Statut par défaut pour le Cash on Delivery
        
        // Relations
        sellerId: post.userId, 
        postId: targetPostId,
        userId: buyer.id, // Garanti par le check du début
        
        /* Décommente si tu as une table OrderItem
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            price: Number(item.price || 0), 
            quantity: item.quantity || 1,
          })),
        },
        */
      },
    });

    // 6. RÉPONSE FINALE
    return NextResponse.json({ 
      success: true, 
      message: "Commande enregistrée ! Le vendeur va vous contacter pour la livraison.",
      orderId: order.id 
    });

  } catch (error: any) {
    console.error("[ORDER_COD_ERROR]:", error);
    return NextResponse.json({ 
      error: "Impossible de valider la commande",
      details: error.message 
    }, { status: 500 });
  }
}