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

    // CORRECTION : On filtre uniquement les commandes dont les frais sont payés
    const orders = await prisma.order.findMany({
      where: { 
        status: "FEE_PAID_AWAITING_DELIVERY" 
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

      // 2. Nettoyage du nom du produit
      const fullContent = order.post?.content || "";
      const productName = fullContent
        .replace(/🛍️\s*PRODUIT\s*:\s*/i, "")
        .split(/[💰🎨📝\n]/)[0]
        .trim();

      // 3. DÉCOUPAGE ROBUSTE (REGEX)
      const notesStr = order.notes || "";
      const colorMatch = notesStr.match(/COULEUR\s*:\s*([^|]+)/i);
      const noteMatch = notesStr.match(/NOTE\s*:\s*(.+)/i);

      const color = colorMatch ? colorMatch[1].trim() : "Standard";
      const note = noteMatch ? noteMatch[1].trim() : "";

      return {
        id: order.id,
        productName: productName || "Article DealCity",
        productImage: firstImage || "/placeholder.png", 
        quantity: order.quantity || 1, 
        clientChoice: color,           
        clientNote: note,              
        price: order.totalAmount, 
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