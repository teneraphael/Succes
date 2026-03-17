import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    const body = await req.json();
    
    const { customerName, customerPhone, customerAddress, items, total, postId } = body;

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // 1. RÉCUPÉRATION DU VENDEUR VIA LE POST
    // On retire "price: true" car il cause l'erreur
    const targetPostId = postId || items[0].id;
    const post = await prisma.post.findUnique({
      where: { id: targetPostId },
      select: { userId: true } // On ne garde que l'ID du vendeur
    });

    if (!post) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // 2. CALCULS FINANCIERS
    // On utilise le total envoyé par le front-end (assure-toi qu'il est correct)
    const amount = Number(total);
    const commission = Math.round(amount * 0.05); 
    const sellerEarnings = amount - commission;

    // 3. CONSTRUCTION DE L'OBJET DATA
    const orderData: any = {
      customerName: customerName || "Anonyme",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress ?? "",
      totalAmount: amount,
      total: amount,
      commission: commission,
      sellerEarnings: sellerEarnings,
      status: "PENDING",
      
      // Relations
      seller: { connect: { id: post.userId } },
      post: { connect: { id: targetPostId } },
      sellerId: post.userId, 

      items: {
        create: items.map((item: any) => ({
          productId: item.id,
          // Ici on utilise le prix envoyé par le panier
          price: Number(item.price || 0), 
          quantity: item.quantity || 1,
        })),
      },
    };

    if (buyer?.id) {
      orderData.user = { connect: { id: buyer.id } };
      orderData.userId = buyer.id;
    }

    // 5. CRÉATION
    const order = await prisma.order.create({
      data: orderData,
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      amount: amount 
    });

  } catch (error: any) {
    console.error("[ORDER_ERROR]", error);
    return NextResponse.json({ 
      error: "Erreur lors de la création de la commande",
      details: error.message 
    }, { status: 500 });
  }
}