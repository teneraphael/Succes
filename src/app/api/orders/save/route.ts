import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from "@/auth";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    
    // DEBUG : Vérifier exactement ce qui arrive à l'API
    console.log("DEBUG_RECUP_BODY:", JSON.stringify(body, null, 2));

    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      note,
      items, 
      total,
      paymentId
    } = body;

    // Validation stricte
    if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Données de commande incomplètes" }, { status: 400 });
    }

    // Calcul de la quantité totale en garantissant des nombres
    const totalQuantity = items.reduce((acc: number, item: any) => {
      const qty = parseInt(item.quantity?.toString()) || 1;
      return acc + qty;
    }, 0);

    const firstItem = items[0];
    const postId = firstItem.postId || firstItem.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Création en base
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        notes: note || "",
        quantity: totalQuantity, 
        totalAmount: Number(total),
        total: Number(total),      
        status: "FEE_PAID_AWAITING_DELIVERY", 
        paymentId: paymentId || null,
        sellerId: post.userId,
        postId: postId,
        commission: 0, 
        sellerEarnings: Number(total),
        items: {
          create: items.map((item: any) => ({
            productId: item.id || item.postId,
            price: Number(item.price),
            // On force la conversion explicite en nombre
            quantity: Number(item.quantity) || 1,
            // On traite la couleur avec une valeur par défaut stricte
            color: (item.color && item.color !== "undefined" && item.color !== "null") 
                    ? String(item.color) 
                    : "Standard"
          }))
        }
      }
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("Erreur critique création commande:", error);
    return NextResponse.json({ 
        error: "Erreur serveur", 
        details: error.message 
    }, { status: 500 });
  }
}