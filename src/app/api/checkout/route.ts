import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    if (!buyer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    
    // On récupère les variables envoyées par ton nouveau formulaire Checkout
    const { 
        postId, 
        total, 
        quantity,
        customerName, 
        customerPhone, 
        customerAddress, 
        selectedColor, // Reçu depuis displayItems[0].color
        note           // Reçu depuis orderNote
    } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true } 
    });

    if (!post) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // Conversion sécurisée du montant
    const totalAmount = Number(total || 0);
    const commission = Math.round(totalAmount * 0.05); 
    const sellerEarnings = totalAmount - commission;

    // --- FORMATION DE LA NOTE FINALE ---
    // On utilise le séparateur " | " pour que l'API Delivery puisse découper les infos
    const finalNote = `COULEUR : ${selectedColor || "Standard"}${note ? ` | NOTE : ${note}` : ""}`;

    const order = await prisma.order.create({
      data: {
        userId: buyer.id,
        sellerId: post.userId,
        postId: postId,
        totalAmount: totalAmount,
        quantity: Number(quantity || 1),
        total: totalAmount, // Compatibilité selon ton schéma
        commission: commission,
        sellerEarnings: sellerEarnings,
        customerName: customerName || "Anonyme",
        customerPhone: customerPhone || "",
        customerAddress: customerAddress || "",
        notes: finalNote, // Contient maintenant "COULEUR : ... | NOTE : ..."
        status: "PENDING", 
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("ERREUR_CRITIQUE_PRISMA:", error);
    return NextResponse.json({ 
        error: "Erreur lors de la commande", 
        details: error.message 
    }, { status: 500 });
  }
}