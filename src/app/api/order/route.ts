import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, items, total } = body;

    // Création de la commande dans Prisma
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        total,
        userId: user?.id || null,
        // On crée les lignes de commande associées
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[ORDER_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}