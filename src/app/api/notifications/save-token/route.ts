import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const { token } = await req.json();

    if (typeof token !== "string" || !token || token.length > 4096) {
      return NextResponse.json(
        { error: "Jeton de notification invalide" },
        { status: 400 }
      );
    }

    // Sauvegarde ou mise à jour du token FCM
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: token },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Erreur serveur lors de l'enregistrement du token FCM:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement du token FCM" },
      { status: 500 }
    );
  }
}
