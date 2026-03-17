import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Monetbil envoie souvent du x-www-form-urlencoded pour les notifications
    const contentType = req.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = await req.json();
    }

    const { status, item_ref: orderId } = data;

    if (!orderId) {
      return NextResponse.json({ message: "ID commande manquant" }, { status: 400 });
    }

    if (status === "success") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
      console.log(`✅ Commande ${orderId} confirmée via Webhook`);
    } else {
      // Si c'est "failed" ou "cancelled", on marque l'échec
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.FAILED },
      });
      console.log(`❌ Paiement échoué pour la commande ${orderId}`);
    }

    // TOUJOURS répondre 200 à Monetbil pour qu'ils arrêtent d'envoyer la notification
    return NextResponse.json({ message: "Notification reçue" }, { status: 200 });

  } catch (error) {
    console.error("Erreur Webhook Monetbil:", error);
    // On renvoie 200 même en cas d'erreur pour éviter que Monetbil ne boucle
    return NextResponse.json({ message: "Erreur traitée" }, { status: 200 });
  }
}