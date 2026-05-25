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
        status: {
          in: ["PENDING", "FEE_PAID_AWAITING_DELIVERY"]
        }
      },
      include: {
        items: true, // Requis pour accéder à la couleur et quantité par item
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
      // Extraction de l'image
      const attachments = order.post?.attachments;
      const firstImage = Array.isArray(attachments) && attachments.length > 0 
        ? attachments[0]?.url 
        : "/placeholder.png";

      // Nettoyage du nom
      const fullContent = order.post?.content || "";
      const productName = fullContent
        .replace(/🛍️\s*PRODUIT\s*:\s*/i, "")
        .split(/[💰🎨📝\n]/)[0]
        .trim();

      // Récupération des données items (avec fallback)
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

      return {
        id: order.id,
        productName: productName || "Article DealCity",
        productImage: firstImage, 
        // Priorité : Quantité dans l'Order, sinon dans l'Item, sinon 1
        quantity: order.quantity || firstItem?.quantity || 1, 
        // Priorité : Couleur dans l'Item, sinon "Standard"
        clientChoice: firstItem?.color || "Standard",           
        clientNote: order.notes || "",             
        price: order.totalAmount, 
        customerName: order.customerName,
        customerPhone: order.customerPhone || "Non fourni",
        deliveryAddress: order.customerAddress || "Non fournie",
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