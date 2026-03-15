import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    const body = await req.json();
    
    const { customerName, customerPhone, customerAddress, items, total, postId } = body;

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const targetPostId = postId || items[0].id;
    const post = await prisma.post.findUnique({
      where: { id: targetPostId },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const amount = Number(total);
    const commission = Math.round(amount * 0.05);
    const sellerEarnings = amount - commission;

    // --- CONSTRUCTION DE L'OBJET DATA ---
    const orderData: any = {
      customerName: customerName || "Anonyme",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress ?? "",
      totalAmount: amount,
      total: amount,
      commission: commission,
      sellerEarnings: sellerEarnings,
      status: "PENDING",
      // Relations obligatoires
      seller: { connect: { id: post.userId } },
      post: { connect: { id: targetPostId } },
      items: {
        create: items.map((item: any) => ({
          productId: item.id,
          price: Number(item.price),
          quantity: item.quantity || 1,
        })),
      },
    };

    // ✅ ON AJOUTE L'ACHETEUR UNIQUEMENT S'IL EXISTE
    // Cela évite de passer un 'undefined' qui fait planter le type
    if (buyer?.id) {
      orderData.user = { connect: { id: buyer.id } };
    }

    const order = await prisma.order.create({
      data: orderData,
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[ORDER_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}