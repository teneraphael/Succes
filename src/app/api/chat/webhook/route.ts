import { sendPushNotification } from "@/lib/push-notifications";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🚀 Webhook reçu, type:", body.type);

    if (body.type === "message.new") {
      const { message, user: sender, channel, members } = body;

      // 1. Extraction robuste des membres (Stream les met soit dans 'members' soit dans 'channel.members')
      const allMembers = members || (channel && channel.members) || [];
      
      // 2. Transformer les objets membres en une liste d'IDs simples
      // On gère les différents formats possibles envoyés par Stream
      const memberIds: string[] = Array.isArray(allMembers)
        ? allMembers.map((m: any) => m.user_id || m.user?.id || m.id)
        : Object.keys(allMembers); // Si c'est un objet, on prend les clés

      // 3. Filtrer pour ne garder que les destinataires (pas celui qui envoie)
      const recipients = [...new Set(memberIds)].filter(id => id && id !== sender.id);

      console.log("✅ IDs des destinataires à chercher dans Prisma:", recipients);

      for (const recipientId of recipients) {
        // 4. Recherche du fcmToken dans ta DB avec le VRAI ID
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { fcmToken: true, displayName: true } 
        });

        if (recipient?.fcmToken) {
          console.log(`📱 Envoi FCM à : ${recipient.displayName || recipientId}`);
          await sendPushNotification(
            recipient.fcmToken,
            `${sender.displayName || sender.name || "Nouveau message"}`,
            message.text || "📷 Pièce jointe",
            {
              type: "CHAT_MESSAGE",
              channelId: channel.id,
              senderId: sender.id
            }
          );
        } else {
          console.log(`⚠️ Aucun token trouvé pour l'ID : ${recipientId} (Utilisateur inconnu ou token absent)`);
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur Webhook Chat:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}