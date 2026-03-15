import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Next.js 15 : on attend les params
    const { orderId } = await (params as any);

    // Vérifier que la commande appartient bien à l'utilisateur qui clique
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== loggedInUser.id) {
      return NextResponse.json({ error: "Ce n'est pas votre commande" }, { status: 403 });
    }

    // Mettre à jour en COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED", 
      },
    });

    return NextResponse.json({ success: true, status: updatedOrder.status });
  } catch (error) {
    console.error("Erreur confirmation client:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}