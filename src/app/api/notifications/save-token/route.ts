import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma"; // Ton instance Prisma client

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Sauvegarde avec Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}