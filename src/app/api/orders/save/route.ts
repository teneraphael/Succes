import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assurez-vous que votre instance prisma est bien ici

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerName, customerPhone, customerAddress, note, items } = body;

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Ici, vous pouvez soit créer une NOUVELLE commande
    // soit mettre à jour celle créée lors de l'étape 1.
    // Exemple : Création d'une nouvelle entrée dans votre table 'Order'
    const newOrder = await prisma.order.create({
     data: {
        id: orderId,
        customerName,
        customerPhone,
        customerAddress,
        notes: note,
        status: "PENDING",
        total: body.total || 0,
        totalAmount: body.total || 0,
        commission: 0,
        sellerEarnings: 0,
        
        // --- LES RELATIONS MANQUANTES ---
        // Si l'utilisateur est connecté, vous devriez avoir son ID
        user: { connect: { id: body.userId } }, 
        // Si vous avez un ID vendeur
        seller: { connect: { id: body.sellerId } },
        // Si la commande est liée à un post spécifique
        post: { connect: { id: items[0].postId } }, 

        items: {
          create: items.map((item: any) => ({
            postId: item.postId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            image: item.image
          }))
        }
      }
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error("Erreur sauvegarde commande:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}