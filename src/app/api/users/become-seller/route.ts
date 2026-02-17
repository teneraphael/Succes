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
      tiktokUrl,    // ✅ Le plus important
      facebookUrl, 
      instagramUrl 
    } = body;

    // 1. Slugification de l'username
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

    if (existingUser && existingUser.id !== user.id) {
      newUsername = `${newUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. Formatage automatique du WhatsApp
    let finalWhatsapp = whatsappUrl;
    if (whatsappUrl && !whatsappUrl.startsWith('http') && whatsappUrl.length >= 8) {
      // Nettoie les espaces et ajoute le préfixe wa.me
      const cleanNum = whatsappUrl.replace(/\s+/g, '');
      finalWhatsapp = `https://wa.me/${cleanNum}`;
    }

    // 3. Logique Pionnier (TikTok donne le badge direct !)
    const hasSocialLink = 
      (tiktokUrl && tiktokUrl.trim() !== "") ||
      (whatsappUrl && whatsappUrl.trim() !== "") || 
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
        // Réseaux Sociaux
        tiktokUrl: tiktokUrl || null,      // ✅ Ajouté
        whatsappUrl: finalWhatsapp || null, // ✅ Formaté
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