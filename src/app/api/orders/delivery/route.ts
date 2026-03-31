import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ton ID Admin/Livreur unique
const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    // 1. Vérification de sécurité Admin/Livreur
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. RÉCUPÉRATION DES COMMANDES À LIVRER
    // On récupère les commandes au statut "PENDING" (celles qui attendent le livreur)
    const orders = await prisma.order.findMany({
      where: { 
        // En mode Cash on Delivery, on affiche ce qui est en attente
        status: "PENDING" 
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
      // Extraction sécurisée de la première image (si présente)
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
        deliveryAddress: order.customerAddress,
        notes: order.notes, // Important pour voir la taille/couleur choisie
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error("DEBUG_DELIVERY_API_ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}