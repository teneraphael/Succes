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
    
    const { 
        items, 
        customerName, 
        customerPhone, 
        customerAddress, 
        note 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide" }, { status: 400 });
    }

    // --- TRAITEMENT DE CHAQUE PRODUIT ---
    const orders = await Promise.all(items.map(async (item: any) => {
      const post = await prisma.post.findUnique({
        where: { id: item.postId },
        select: { userId: true } 
      });

      if (!post) return null;

      const itemTotal = Number(item.price) * Number(item.quantity);
      const commission = Math.round(itemTotal * 0.05); 
      const sellerEarnings = itemTotal - commission;

      const finalNote = `COULEUR : ${item.color || "Standard"}${note ? ` | NOTE : ${note}` : ""}`;

      return prisma.order.create({
        data: {
          userId: buyer.id,
          sellerId: post.userId,
          postId: item.postId,
          totalAmount: itemTotal,
          quantity: Number(item.quantity || 1),
          total: itemTotal,
          commission: commission,
          sellerEarnings: sellerEarnings,
          customerName: customerName || "Anonyme",
          customerPhone: customerPhone || "",
          customerAddress: customerAddress || "",
          notes: finalNote,
          status: "PENDING", 
        },
      });
    }));

    // Filtrer les éventuels produits introuvables
    const successfulOrders = orders.filter(o => o !== null);

    if (successfulOrders.length === 0) {
      return NextResponse.json({ error: "Aucune commande n'a pu être créée" }, { status: 500 });
    }

    // --- CORRECTION : Retourner les informations nécessaires au paiement ---
    // On renvoie l'ID de la première commande et les frais de livraison
    return NextResponse.json({ 
      success: true, 
      count: successfulOrders.length,
      orderId: successfulOrders[0]?.id, // ID utilisé pour lier le paiement
      deliveryFee: 1000,                // Montant des frais de livraison
      message: "Commandes enregistrées avec succès" 
    });

  } catch (error: any) {
    console.error("ERREUR_CRITIQUE_CHECKOUT:", error);
    return NextResponse.json({ 
        error: "Erreur lors de la commande", 
        details: error.message 
    }, { status: 500 });
  }
}