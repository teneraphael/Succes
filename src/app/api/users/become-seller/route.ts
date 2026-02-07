import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    const { businessName, businessDomain, businessEmail, businessProducts } = body;

    // 1. Génération d'un username propre (slugification)
    let newUsername = businessName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/\s+/g, "")             // Supprime les espaces
      .replace(/[^\w]/gi, "");         // Supprime tout ce qui n'est pas alphanumérique

    // 2. Vérification de collision d'username
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    // Si le nom est déjà pris par un autre compte, on ajoute un suffixe
    if (existingUser && existingUser.id !== user.id) {
      newUsername = `${newUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Mise à jour de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSeller: true,
        username: newUsername,
        displayName: businessName,
        // Ces colonnes doivent exister dans schema.prisma
        businessName,
        businessDomain,
        businessEmail,
        businessProducts,
      },
    });

    return NextResponse.json({ success: true, newUsername });

  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du vendeur:", error);

    // ✅ Gestion sécurisée du type 'unknown' pour TypeScript
    if (typeof error === "object" && error !== null) {
      // Vérification spécifique pour les erreurs Prisma (code P2002 = Unique constraint failed)
      if ("code" in error && error.code === "P2002") {
        return new NextResponse("Ce nom de boutique ou ce nom d'utilisateur est déjà utilisé", { status: 400 });
      }
      
      // Si c'est une erreur standard, on peut extraire le message
      if (error instanceof Error) {
        return new NextResponse(error.message, { status: 500 });
      }
    }

    return new NextResponse("Une erreur interne est survenue", { status: 500 });
  }
}