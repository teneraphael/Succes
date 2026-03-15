import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client"; // ✅ Importation cruciale

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const status = formData.get("status"); 
    const orderId = formData.get("item_ref"); 

    if (!orderId || !status) {
      return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
    }

    if (status === "success") {
      await prisma.order.update({
        where: { id: orderId as string },
        data: {
          // ✅ Utilise l'Enum pour éviter les erreurs de frappe/casse
          status: OrderStatus.PAID, 
        },
      });

      console.log(`✅ Commande ${orderId} payée !`);
      return NextResponse.json({ message: "OK" }, { status: 200 });
      
    } else {
      await prisma.order.update({
        where: { id: orderId as string },
        // ✅ Utilise l'Enum ici aussi
        data: { status: OrderStatus.FAILED }, 
      });
      
      return NextResponse.json({ message: "Paiement échoué" }, { status: 200 });
    }

  } catch (error) {
    console.error("Erreur Webhook Monetbil:", error);
    return NextResponse.json({ message: "Erreur interne" }, { status: 200 });
  }
}