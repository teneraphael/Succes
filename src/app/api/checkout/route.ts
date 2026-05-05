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
        items, // On récupère le tableau complet envoyé par le front-end
        customerName, 
        customerPhone, 
        customerAddress, 
        note 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide" }, { status: 400 });
    }

    // --- TRAITEMENT DE CHAQUE PRODUIT ---
    // On utilise Promise.all pour créer toutes les lignes de commande en parallèle
    const orders = await Promise.all(items.map(async (item: any) => {
      // 1. Trouver le vendeur pour chaque produit
      const post = await prisma.post.findUnique({
        where: { id: item.postId },
        select: { userId: true } 
      });

      if (!post) return null;

      // 2. Calculs financiers pour cet article précis
      const itemTotal = Number(item.price) * Number(item.quantity);
      const commission = Math.round(itemTotal * 0.05); 
      const sellerEarnings = itemTotal - commission;

      // 3. Formatage de la note (Couleur de l'item + Note globale du client)
      const finalNote = `COULEUR : ${item.color || "Standard"}${note ? ` | NOTE : ${note}` : ""}`;

      // 4. Création de la commande dans la DB
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

    // Filtrer les éventuels produits introuvables (null)
    const successfulOrders = orders.filter(o => o !== null);

    return NextResponse.json({ 
      success: true, 
      count: successfulOrders.length,
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