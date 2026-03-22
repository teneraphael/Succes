import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/notifications";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Définition du type pour que TypeScript reconnaisse les inclusions (seller, post)
type OrderWithRelations = Prisma.OrderGetPayload<{
  include: { seller: true; post: true };
}>;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = await req.json();
    }

    const { status, item_ref: orderId, transaction_id: txId } = data;

    if (!orderId) return new Response("Missing ID", { status: 200 });

    if (status === "success") {
      const vCode = Math.floor(1000 + Math.random() * 9000).toString();

      // On force le type avec 'as OrderWithRelations' pour corriger l'erreur de propriété
      const updatedOrder = (await prisma.order.update({
        where: { id: orderId as string },
        data: {
          status: "PAID",
          paymentId: txId as string,
          deliveryCode: vCode,
        },
        include: {
          seller: true,
          post: true,
        },
      })) as OrderWithRelations;

      console.log(`✅ Commande ${orderId} validée et Code OTP généré.`);

      // Bloc d'envoi SMS
      try {
        // 1. SMS à l'acheteur avec son code secret
        await sendSMS(
          updatedOrder.customerPhone,
          `DealCity: Paiement reçu ! Votre code de réception est : ${vCode}. Donnez-le au livreur UNIQUEMENT quand vous aurez le colis en main.`
        );

        // 2. SMS au vendeur pour qu'il prépare le colis
        if (updatedOrder.seller?.phoneNumber) {
          await sendSMS(
            updatedOrder.seller.phoneNumber,
            `Félicitations ! Votre article "${updatedOrder.post.content.substring(
              0,
              20
            )}..." a été acheté. Préparez le colis, un livreur va vous contacter.`
          );
        }
      } catch (smsError) {
        console.error("⚠️ Erreur lors de l'envoi des SMS:", smsError);
      }
    } else if (status === "failed" || status === "cancelled") {
      await prisma.order.update({
        where: { id: orderId as string },
        data: { status: "FAILED" },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("🚨 Webhook Error:", error);
    return new Response("OK", { status: 200 });
  }
}