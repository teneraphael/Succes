import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    const { businessName, businessDomain, businessEmail, businessProducts } = body;

    // 1. Préparation du nouveau nom d'utilisateur 
    // On transforme "Ma Super Boutique" en "masuperboutique" pour l'URL
    const newUsername = businessName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "") // Enlève les espaces
      .replace(/[^\w\s]/gi, ""); // Enlève les caractères spéciaux

    // 2. Mise à jour de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSeller: true,
        username: newUsername, // Le nom d'utilisateur change ici
        displayName: businessName, // On met aussi à jour le nom affiché (plus joli)
        businessName: businessName,
        businessDomain: businessDomain,
        businessEmail: businessEmail,
        businessProducts: businessProducts,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du vendeur:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}