import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    if (!buyer) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const { items, customerName, customerPhone, customerAddress, note } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Utilisation de la version "callback" de $transaction
    const results = await prisma.$transaction(async (tx) => {
      const createdOrders = [];

      for (const item of items) {
        const idToFind = item.postId || item.id;
        
        // On effectue la recherche dans la transaction (tx)
        const post = await tx.post.findUnique({
          where: { id: idToFind },
          select: { userId: true, price: true }
        });

        if (!post) throw new Error(`Produit ${idToFind} introuvable`);

        const itemTotal = Number(item.price || post.price) * Number(item.quantity || 1);
        const commission = Math.round(itemTotal * 0.05);
        
        // On crée la commande dans la transaction (tx)
        const order = await tx.order.create({
          data: {
            userId: buyer.id,
            sellerId: post.userId,
            postId: idToFind,
            totalAmount: itemTotal,
            quantity: Number(item.quantity || 1),
            total: itemTotal,
            commission: commission,
            sellerEarnings: itemTotal - commission,
            customerName: customerName || "Anonyme",
            customerPhone: customerPhone || "",
            customerAddress: customerAddress || "",
            notes: `COULEUR: ${item.color || "Standard"} | NOTE: ${note || "Aucune"}`,
            status: "PENDING",
          },
        });
        
        createdOrders.push(order);
      }
      return createdOrders;
    });

    return NextResponse.json({ success: true, orders: results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}