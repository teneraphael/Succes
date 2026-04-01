import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { 
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

    const formattedOrders = orders.map((order: any) => {
      // 1. Extraction de l'image
      const attachments = order.post?.attachments;
      const firstImage = Array.isArray(attachments) && attachments.length > 0 
        ? attachments[0]?.url 
        : null;

      // 2. NETTOYAGE DU NOM DU PRODUIT
      // On retire les émojis et on s'arrête au premier signe de prix ou de description
      const fullContent = order.post?.content || "";
      const productName = fullContent
        .replace(/🛍️\s*PRODUIT\s*:\s*/i, "") // Retire le préfixe
        .split(/[💰🎨📝\n]/)[0]             // Coupe avant le prix, les couleurs ou la description
        .trim();

      // 3. DÉCOUPAGE COULEUR ET NOTE (Format : "COULEUR : ... | NOTE : ...")
      const notesParts = order.notes?.split(" | ") || [];
      const color = notesParts.find((p: string) => p.includes("COULEUR :"))?.replace("COULEUR : ", "") || "Standard";
      const note = notesParts.find((p: string) => p.includes("NOTE :"))?.replace("NOTE : ", "") || "";

      return {
        id: order.id,
        productName: productName || "Article DealCity",
        productImage: firstImage || "/placeholder.png", 
        // 4. GESTION DE LA QUANTITÉ
        // Si tu as un champ quantity dans ta DB, utilise order.quantity
        // Sinon, on peut la déduire si nécessaire, ici par défaut 1 ou via ta DB :
        quantity: order.quantity || 1, 
        price: order.totalAmount, // Le prix total à payer par le client
        clientColor: color,
        clientNote: note,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.customerAddress,
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