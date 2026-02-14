import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Données manquantes : userId ou token absent" },
        { status: 400 }
      );
    }

    // Sauvegarde ou mise à jour du token FCM
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });

    console.log(`✅ Token FCM enregistré pour l'utilisateur ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Erreur serveur lors de l'enregistrement du token FCM:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement du token FCM" },
      { status: 500 }
    );
  }
}
