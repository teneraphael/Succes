import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> } // CRITIQUE : Promise pour Next 15
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    // 1. Vérification Admin/Livreur
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // 2. Récupération de l'ID (on attend la promise)
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 3. Mise à jour du statut
    // On passe de PENDING à SHIPPED (ou DELIVERED)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED", // C'est ce statut qui fera apparaître le bouton chez le client
      },
    });

    return NextResponse.json({ 
      success: true, 
      newStatus: updatedOrder.status 
    });

  } catch (error: any) {
    console.error("[DELIVERY_CONFIRM_ERROR]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation", details: error.message }, 
      { status: 500 }
    );
  }
}