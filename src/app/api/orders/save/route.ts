import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from "@/auth";

export async function POST(request: Request) {
  try {
    // 1. Authentification
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      note,
      items,
      total,
      paymentId
    } = body;

    // 2. Validation basique
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0 || !total) {
      return NextResponse.json({ error: "Données de commande incomplètes" }, { status: 400 });
    }

    // 3. Récupération du vendeur (Post) pour éviter l'erreur de Foreign Key
    const firstItem = items[0];
    const post = await prisma.post.findUnique({
      where: { id: firstItem.postId || firstItem.id },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // 4. Création de la commande
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        customerName,
        customerPhone,
        customerAddress,
        notes: note || "",
        totalAmount: Number(total),
        total: Number(total),      
        status: "PENDING",
        paymentId: paymentId || null, // null est préférable à "COD" si le champ est optionnel
        sellerId: post.userId,        // Le vrai ID du vendeur
        postId: firstItem.postId || firstItem.id,
        commission: 0, 
        sellerEarnings: Number(total), // À ajuster selon ta logique de commission
        items: {
          create: items.map((item: any) => ({
            productId: item.id || item.postId,
            price: Number(item.price)
          }))
        }
      }
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("Erreur création commande:", error);
    return NextResponse.json({ 
        error: "Erreur serveur lors de la sauvegarde", 
        details: error.message 
    }, { status: 500 });
  }
}