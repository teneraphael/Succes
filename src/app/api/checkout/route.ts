import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    if (!buyer) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    
    // On déstructure les variables avec les noms exacts envoyés par ton formulaire
    const { 
        postId, 
        total, 
        customerName, 
        customerPhone, 
        customerAddress, 
        note 
    } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true } 
    });

    if (!post) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    // Conversion sécurisée du montant
    const totalAmount = Number(total || 0);
    const commission = Math.round(totalAmount * 0.05); 
    const sellerEarnings = totalAmount - commission;

    const order = await prisma.order.create({
      data: {
        userId: buyer.id,
        sellerId: post.userId,
        postId: postId,
        totalAmount: totalAmount,
        total: totalAmount, // Au cas où tu as les deux champs en base
        commission: commission,
        sellerEarnings: sellerEarnings,
        customerName: customerName || "Anonyme",
        customerPhone: customerPhone || "",
        customerAddress: customerAddress || "",
        notes: note || "", 
        status: "PENDING", 
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    // Si ça plante encore, ceci affichera l'erreur précise dans ton terminal VS Code
    console.error("ERREUR_CRITIQUE_PRISMA:", error);
    return NextResponse.json({ 
        error: "Erreur lors de la commande", 
        details: error.message 
    }, { status: 500 });
  }
}