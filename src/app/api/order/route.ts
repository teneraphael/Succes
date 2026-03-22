import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Identification de l'acheteur (Optionnel si achat invité, mais recommandé)
    const { user: buyer } = await validateRequest();
    const body = await req.json();
    
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      items, 
      total, 
      postId, 
      note // Récupération de la note de personnalisation
    } = body;

    if (!items || items.length === 0) {
        return NextResponse.json({ error: "Votre panier est vide" }, { status: 400 });
    }

    // 2. RÉCUPÉRATION DU VENDEUR (Via le premier produit du panier ou postId)
    const targetPostId = postId || items[0].id;
    const post = await prisma.post.findUnique({
      where: { id: targetPostId },
      select: { userId: true } 
    });

    if (!post) {
      return NextResponse.json({ error: "Le produit n'existe plus." }, { status: 404 });
    }

    // 3. CALCULS FINANCIERS SÉCURISÉS
    const amount = Number(total);
    const commission = Math.round(amount * 0.05); // Commission DealCity 5%
    const sellerEarnings = amount - commission;

    // 4. CONSTRUCTION DE L'OBJET DE COMMANDE
    // Note : On utilise le statut "INITIALIZED" pour que le livreur ne voie pas la commande
    // tant que le Webhook Monetbil n'a pas confirmé le paiement.
    const orderData: any = {
      customerName: customerName || "Anonyme",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress ?? "",
      notes: note || "", // Stockage de la taille/couleur/préférence
      totalAmount: amount,
      total: amount,
      commission: commission,
      sellerEarnings: sellerEarnings,
      status: "INITIALIZED", // <--- Verrou de sécurité
      
      // Relations obligatoires
      sellerId: post.userId, 
      postId: targetPostId,

      // Création des items liés (si ta table OrderItem existe)
      items: {
        create: items.map((item: any) => ({
          productId: item.id,
          price: Number(item.price || 0), 
          quantity: item.quantity || 1,
        })),
      },
    };

    // Si l'utilisateur est connecté, on lie la commande à son compte
    if (buyer?.id) {
      orderData.userId = buyer.id;
    }

    // 5. CRÉATION DANS LA BASE DE DONNÉES
    const order = await prisma.order.create({
      data: orderData,
    });

    // 6. RÉPONSE POUR LE FRONTEND
    // Ces infos seront utilisées pour appeler l'API Monetbil juste après
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      amount: amount,
      customerPhone: customerPhone
    });

  } catch (error: any) {
    console.error("[ORDER_CREATE_ERROR]:", error);
    return NextResponse.json({ 
      error: "Impossible de générer la commande",
      details: error.message 
    }, { status: 500 });
  }
}