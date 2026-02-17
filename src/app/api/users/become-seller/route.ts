import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    
    // On extrait les nouveaux champs du body
    const { 
      businessName, 
      businessDomain, 
      businessEmail, 
      businessProducts, 
      whatsappUrl, 
      facebookUrl, 
      instagramUrl 
    } = body;

    // 1. Génération d'un username propre (slugification)
    let newUsername = businessName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "")             
      .replace(/[^\w]/gi, "");         

    // 2. Vérification de collision d'username
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUser && existingUser.id !== user.id) {
      newUsername = `${newUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Logique de récompense Pionnier
    // On devient Pionnier si au moins UN lien social est fourni
    const hasSocialLink = 
      (whatsappUrl && whatsappUrl.trim() !== "") || 
      (facebookUrl && facebookUrl.trim() !== "") || 
      (instagramUrl && instagramUrl.trim() !== "");

    // 4. Mise à jour de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSeller: true,
        username: newUsername,
        displayName: businessName,
        businessName,
        businessDomain,
        businessEmail,
        businessProducts,
        // Enregistrement des liens spécifiques
        whatsappUrl: whatsappUrl || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        // Status
        isPioneer: !!hasSocialLink, 
        isVerified: false, 
      },
    });

    return NextResponse.json({ 
      success: true, 
      newUsername, 
      isPioneer: !!hasSocialLink 
    });

  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du vendeur:", error);

    if (typeof error === "object" && error !== null) {
      if ("code" in error && error.code === "P2002") {
        return new NextResponse("Ce nom de boutique est déjà utilisé", { status: 400 });
      }
    }

    return new NextResponse("Une erreur interne est survenue", { status: 500 });
  }
}