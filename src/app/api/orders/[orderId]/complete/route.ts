import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ton ID Admin (Livreur)
const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // 1. Vérification de l'identité du livreur
    const { user: loggedInUser } = await validateRequest();
    
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. Récupération de l'ID de la commande
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 3. Récupération de la commande avec le produit associé pour vérifier le stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { post: true } // On récupère le post lié pour vérifier le stock réel
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. Vérifications d'état
    if (order.status === "DELIVERED") {
      return NextResponse.json({ error: "Cette commande est déjà marquée comme livrée." }, { status: 400 });
    }

    // 5. TRANSACTION PRISMA : Sécurisation de l'état
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Décrémentation du stock avec condition de sécurité (stock >= quantité)
      if (order.postId) {
        const quantityToReduce = order.quantity || 1;

        const updatedPost = await tx.post.updateMany({
          where: { 
            id: order.postId,
            stock: { gte: quantityToReduce } // La requête échoue si stock < quantité
          },
          data: {
            stock: { decrement: quantityToReduce },
          },
        });

        if (updatedPost.count === 0) {
          throw new Error("Stock insuffisant pour valider cette livraison.");
        }
      }

      // B. Mise à jour du statut de la commande
      return await tx.order.update({
        where: { id: orderId },
        data: { 
          status: "DELIVERED",
          updatedAt: new Date()
        },
      });
    });

    console.log(`✅ Commande ${orderId} : Colis livré et stock mis à jour.`);

    return NextResponse.json({ 
      success: true, 
      order: result 
    });

  } catch (error: any) {
    console.error("ERREUR_LIVREUR_UPDATE:", error);
    return NextResponse.json({ 
      error: error.message || "Erreur lors de la mise à jour"
    }, { status: 500 });
  }
}