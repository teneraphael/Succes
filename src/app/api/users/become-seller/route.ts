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
      phoneNumber,   // ✅ Récupéré depuis le nouveau formulaire
      tiktokUrl, 
      facebookUrl, 
      instagramUrl 
    } = body;

    // 1. Slugification de l'username (URL propre)
    let newUsername = businessName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "")             
      .replace(/[^\w]/gi, "");         

    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    // Si l'username existe déjà, on ajoute un suffixe aléatoire
    if (existingUser && existingUser.id !== user.id) {
      newUsername = `${newUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. Nettoyage du numéro de téléphone
    // On enlève tout ce qui n'est pas un chiffre pour avoir un format pur (ex: 237690...)
    const cleanPhoneNumber = phoneNumber ? phoneNumber.replace(/\D/g, '') : null;

    // 3. Logique Pionnier (Si l'un des liens est rempli, il devient Pionnier)
    const hasSocialLink = 
      (tiktokUrl && tiktokUrl.trim() !== "") ||
      (whatsappUrl && whatsappUrl.trim() !== "") || 
      (phoneNumber && phoneNumber.trim() !== "") || // Le téléphone compte aussi
      (facebookUrl && facebookUrl.trim() !== "") || 
      (instagramUrl && instagramUrl.trim() !== "");

    // 4. Mise à jour Database
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
        // Contacts
        phoneNumber: cleanPhoneNumber, // ✅ TRÈS IMPORTANT : Pour le bouton "Discuter"
        whatsappUrl: whatsappUrl || null, // ✅ Gardé tel quel pour ton sourcing (lien groupe)
        // Réseaux Sociaux
        tiktokUrl: tiktokUrl || null,
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
    console.error("Erreur API Become Seller:", error);
    return new NextResponse("Une erreur est survenue", { status: 500 });
  }
}