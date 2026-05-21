import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // Monetbil envoie les données en POST body (x-www-form-urlencoded)
  const formData = await req.formData();
  const orderId = formData.get("order_id") as string;
  const status = formData.get("status"); // "SUCCESS" si payé

  if (status === "SUCCESS") {
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        deliveryFeePaid: true,
        status: "FEE_PAID_AWAITING_DELIVERY"
      },
    });
    return NextResponse.json({ message: "Paiement validé" }, { status: 200 });
  }

  return NextResponse.json({ message: "Échec du paiement" }, { status: 400 });
}