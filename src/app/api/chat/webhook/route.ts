import { sendPushNotification } from "@/lib/push-notifications";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 'message.new' est l'événement envoyé par Stream quand un message arrive
    if (body.type === "message.new") {
      const message = body.message;
      const sender = body.user;
      
      // On récupère les IDs des autres membres du channel
      const memberIds = Object.keys(body.channel.members).filter(
        (id) => id !== sender.id
      );

      // On envoie une notification push à chaque destinataire
      for (const recipientId of memberIds) {
        await sendPushNotification(
          recipientId,
          `Message de ${sender.name || sender.id}`,
          message.text || "📷 Image ou fichier"
        );
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Erreur Webhook Chat:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}