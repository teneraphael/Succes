import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    // 1. Vérification de sécurité Admin/Livreur
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. On récupère les commandes réellement PAYÉES (grâce au Webhook)
    const orders = await prisma.order.findMany({
      where: { 
        // IMPORTANT: Seul le statut "PAID" garantit que l'argent est chez DealCity
        status: "PAID" 
      },
      include: {
        post: {
          select: {
            content: true,
            attachments: true, 
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Formatage pour le Dashboard Livreur
    const formattedOrders = orders.map((order) => {
      // Extraction sécurisée de la première image
      const attachments = (order.post as any)?.attachments;
      const firstImage = Array.isArray(attachments) && attachments.length > 0 
        ? attachments[0]?.url 
        : null;

      return {
        id: order.id,
        productName: order.post?.content || "Produit DealCity",
        productImage: firstImage || "/placeholder.png", 
        price: order.totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        // On mappe customerAddress vers deliveryAddress pour le Dashboard
        deliveryAddress: order.customerAddress,
        notes: order.notes, // Affiche la taille/couleur/note
        status: order.status,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("DEBUG_DELIVERY_API_ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}