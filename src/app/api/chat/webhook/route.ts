import { sendPushNotification } from "@/lib/push-notifications";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log pour le debug sur Vercel
    console.log("Webhook reçu, type:", body.type);

    if (body.type === "message.new") {
      const { message, user: sender, channel, members } = body;

      // 1. Extraction robuste des membres
      const allMembers = members || (channel && channel.members) || [];
      const memberIds: string[] = Array.isArray(allMembers)
        ? allMembers.map((m: any) => m.user_id || m.user?.id || m.id)
        : Object.keys(allMembers);

      // 2. Filtrer pour ne garder que les destinataires
      const recipients = [...new Set(memberIds)].filter(id => id && id !== sender.id);

      // 3. Traitement des notifications
      // Note: On utilise Promise.all pour aller plus vite au lieu d'un for loop lent
      await Promise.all(recipients.map(async (recipientId) => {
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { fcmToken: true, displayName: true } 
        });

        if (recipient?.fcmToken) {
          await sendPushNotification(
            recipient.fcmToken,
            `${sender.displayName || sender.name || "Nouveau message"}`,
            message.text || "📷 Pièce jointe",
            {
              type: "CHAT_MESSAGE",
              channelId: channel?.id || "",
              senderId: sender.id
            }
          );
        }
      }));
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Erreur Webhook Chat:", error);
    // On renvoie quand même un 200 ou 500 selon si on veut que Stream réessaie
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}