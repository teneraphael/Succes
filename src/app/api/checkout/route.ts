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

    const results = await prisma.$transaction(async (tx: any) => {
      const createdOrders = [];

      for (const item of items) {
        const idToFind = item.postId || item.id;
        const qtyToDecrement = Number(item.quantity || 1);
        
        // 1. Recherche du produit parent
        const post = await tx.post.findUnique({
          where: { id: idToFind },
          select: { userId: true, price: true, stock: true }
        });

        if (!post) throw new Error(`Produit ${idToFind} introuvable`);

        let variantId = item.variantId ? String(item.variantId) : null;

        // 2. Gestion et décrémentation des stocks
        if (variantId) {
          const variant = await tx.variant.findUnique({
            where: { id: variantId },
            select: { stock: true }
          });

          if (!variant) throw new Error(`Variante introuvable.`);
          if (variant.stock < qtyToDecrement) throw new Error(`Stock insuffisant pour cette variante.`);

          await tx.variant.update({
            where: { id: variantId },
            data: { stock: { decrement: qtyToDecrement } }
          });
        } else {
          if (post.stock < qtyToDecrement) throw new Error(`Stock insuffisant pour : ${item.name || idToFind}.`);

          await tx.post.update({
            where: { id: idToFind },
            data: { stock: { decrement: qtyToDecrement } }
          });
        }

        // 3. Calculs financiers
        const itemPrice = Number(item.price || post.price);
        const itemTotal = itemPrice * qtyToDecrement;
        const commission = Math.round(itemTotal * 0.05);
        
        // 4. Création de la commande
        const order = await tx.order.create({
          data: {
            userId: buyer.id,
            sellerId: post.userId,
            postId: idToFind,
            variantId: variantId, // 🌟 AJOUT : Sauvegarde l'ID de la variante
            totalAmount: itemTotal,
            quantity: qtyToDecrement,
            commission: commission,
            sellerEarnings: itemTotal - commission,
            customerName: (customerName || "Anonyme").trim(),
            customerPhone: (customerPhone || "").trim(),
            customerAddress: (customerAddress || "").trim(),
            notes: `Option: ${item.selectedOptions || item.color || "Standard"} | Note: ${note || "Aucune"}`,
            status: "PENDING",
          },
        });
        
        createdOrders.push(order);
      }
      return createdOrders;
    });

    return NextResponse.json({ success: true, orders: results });

  } catch (error: any) {
    console.error("Erreur API Order Save:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}