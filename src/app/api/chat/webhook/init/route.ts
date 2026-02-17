export const dynamic = "force-dynamic";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

const COST_CONTACT = 100; // Prix de la mise en relation

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { recipientId, postId } = await req.json();

    if (loggedInUser.id === recipientId) {
      return Response.json({ message: "Self contact" });
    }

    // 1. Vérifier si une transaction "CONTACT" existe déjà entre ces deux-là
    const existingContact = await prisma.transaction.findFirst({
      where: {
        userId: recipientId,
        reason: { startsWith: `CONTACT_FROM_${loggedInUser.id}` }
      }
    });

    // Si déjà payé par le passé, on laisse passer gratuitement
    if (existingContact) {
      return Response.json({ success: true, alreadyPaid: true });
    }

    // 2. Vérifier si le destinataire est un vendeur et son solde
    const seller = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { balance: true, isSeller: true }
    });

    if (seller?.isSeller) {
      if ((seller.balance ?? 0) < COST_CONTACT) {
        return Response.json(
          { error: "Le forfait de ce vendeur est épuisé. Il ne peut plus recevoir de nouveaux clients." },
          { status: 403 }
        );
      }

      // 3. Débiter le vendeur
      await prisma.$transaction([
        prisma.user.update({
          where: { id: recipientId },
          data: { balance: { decrement: COST_CONTACT } }
        }),
        prisma.transaction.create({
          data: {
            userId: recipientId,
            amount: -COST_CONTACT,
            reason: `CONTACT_FROM_${loggedInUser.id}_POST_${postId}`,
          }
        })
      ]);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}