import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");
    let data: any;

    // Monetbil envoie du x-www-form-urlencoded
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = await req.json();
    }

    const { status, item_ref: orderId, transaction_id: txId } = data;

    if (!orderId) return new Response("Missing ID", { status: 200 });

    if (status === "success") {
      // ON VALIDE LE PAIEMENT RÉEL ICI
      await prisma.order.update({
        where: { id: orderId as string },
        data: { 
          status: "PAID", 
          // On peut stocker l'ID de transaction pour preuve en cas de litige
        },
      });
      console.log(`✅ Commande ${orderId} validée (Argent encaissé)`);
    } else if (status === "failed" || status === "cancelled") {
      await prisma.order.update({
        where: { id: orderId as string },
        data: { status: "FAILED" },
      });
    }

    // Toujours répondre 200 à Monetbil
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("OK", { status: 200 });
  }
}