import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function POST( // Changé de PATCH à POST pour correspondre à ton dashboard
  req: Request,
  { params }: { params: Promise<{ orderId: string }> } // Type correct Next 15
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Next.js 15 : on attend les params
    const { orderId } = await params;

    // 1. Trouver la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 2. SÉCURITÉ : Autoriser le Client OU l'Admin/Livreur
    const isOwner = order.userId === loggedInUser.id;
    const isAdmin = loggedInUser.id === MY_ADMIN_ID;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 3. LOGIQUE DE STATUT
    // Si c'est l'ADMIN (Livreur), on met SHIPPED (pour débloquer le client)
    // Si c'est le CLIENT, on met COMPLETED (fin du processus)
    const nextStatus = isAdmin ? "SHIPPED" : "COMPLETED";

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus, 
      },
    });

    return NextResponse.json({ success: true, status: updatedOrder.status });
    
  } catch (error: any) {
    console.error("Erreur validation:", error);
    return NextResponse.json({ error: "Erreur serveur", details: error.message }, { status: 500 });
  }
}