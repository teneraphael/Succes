import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    
    const { 
      businessName, 
      businessDomain, 
      businessEmail, 
      businessProducts, 
      whatsappUrl, 
      phoneNumber,
      tiktokUrl, 
      facebookUrl, 
      instagramUrl 
    } = body;

    // 1. Slugification sécurisée
    let newUsername = businessName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "") 
      .replace(/[^\w]/gi, "");

    // Vérification de l'unicité avec boucle de sécurité
    let isUnique = false;
    let attempt = 0;
    let finalUsername = newUsername;

    while (!isUnique && attempt < 5) {
      const existingUser = await prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (!existingUser || existingUser.id === user.id) {
        isUnique = true;
      } else {
        finalUsername = `${newUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
        attempt++;
      }
    }

    // 2. Nettoyage du numéro de téléphone
    const cleanPhoneNumber = phoneNumber ? phoneNumber.replace(/\D/g, '') : null;

    // 3. Logique Pionnier
    const hasSocialLink = !!(
      (tiktokUrl?.trim()) ||
      (whatsappUrl?.trim()) || 
      (cleanPhoneNumber) || 
      (facebookUrl?.trim()) || 
      (instagramUrl?.trim())
    );

    // 4. Mise à jour Database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSeller: true,
        username: finalUsername,
        displayName: businessName.trim(),
        businessName: businessName.trim(),
        businessDomain: businessDomain?.trim(),
        businessEmail: businessEmail?.trim(),
        businessProducts: businessProducts?.trim(),
        phoneNumber: cleanPhoneNumber,
        whatsappUrl: whatsappUrl?.trim() || null,
        tiktokUrl: tiktokUrl?.trim() || null,
        facebookUrl: facebookUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        isPioneer: hasSocialLink, 
        isVerified: false, 
      },
    });

    return NextResponse.json({ 
      success: true, 
      newUsername: finalUsername, 
      isPioneer: hasSocialLink 
    });

  } catch (error) {
    console.error("Erreur API Finalize Seller:", error);
    return new NextResponse("Une erreur est survenue lors de l'enregistrement", { status: 500 });
  }
}