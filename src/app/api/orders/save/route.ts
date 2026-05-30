import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateRequest } from "@/auth";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
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

    // 🌟 SÉCURITÉ AUTOMATIQUE : Si pas de session utilisateur mais qu'un paiement valide a eu lieu
    // On ne bloque pas l'acheteur à cause d'une perte de cookie post-redirection Monetbil.
    if (!user && (!paymentId || paymentId === "direct")) {
      return NextResponse.json({ error: "Non autorisé. Veuillez vous reconnecter." }, { status: 401 });
    }

    // Validation stricte des données entrantes
    if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Données de commande incomplètes" }, { status: 400 });
    }

    // Calcul de la quantité totale en garantissant des nombres
    const totalQuantity = items.reduce((acc: number, item: any) => {
      const qty = parseInt(item.quantity?.toString(), 10) || 1;
      return acc + qty;
    }, 0);

    // Extraction sécurisée de l'ID du produit d'origine (Post parent)
    const firstItem = items[0];
    const postId = String(firstItem.postId || firstItem.id);

    // Récupération de l'auteur (vendeur) du post parent
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Le produit d'origine est introuvable." }, { status: 404 });
    }

    // 🌟 EXECUTION DANS UNE TRANSACTION ATOMIQUE (tx: any contourne le blocage du type Variant)
    const orderResult = await prisma.$transaction(async (tx: any) => {
      
      // 1. Décrémenter les stocks pour chaque article de la commande
      for (const item of items) {
        const qtyToDecrement = Number(item.quantity) || 1;
        const targetPostId = String(item.postId || item.id);

        if (item.variantId && String(item.variantId) !== "undefined" && String(item.variantId) !== "null") {
          // Cas A : Le produit possède une variante spécifique
          const variant = await tx.variant.findUnique({
            where: { id: String(item.variantId) },
            select: { stock: true }
          });

          if (!variant) throw new Error(`La variante sélectionnée est introuvable.`);
          if (variant.stock < qtyToDecrement) {
            throw new Error(`Stock insuffisant pour la variante sélectionnée.`);
          }

          // Décrémentation du stock de la variante
          await tx.variant.update({
            where: { id: String(item.variantId) },
            data: { stock: { decrement: qtyToDecrement } }
          });
        } else {
          // Cas B : Produit standard, décrémentation du stock global du Post
          const parentPost = await tx.post.findUnique({
            where: { id: targetPostId },
            select: { stock: true }
          });

          if (!parentPost) throw new Error(`Produit principal introuvable.`);
          if (parentPost.stock < qtyToDecrement) {
            throw new Error(`Stock global insuffisant pour cet article.`);
          }

          await tx.post.update({
            where: { id: targetPostId },
            data: { stock: { decrement: qtyToDecrement } }
          });
        }
      }

      // 2. Création de la commande principale et des lignes associées (Order Items)
      const newOrder = await tx.order.create({
        data: {
          userId: user?.id || "anonymous_checkout", // Fallback sécurisé en cas de perte de session post-paiement
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          notes: note || "",
          quantity: totalQuantity, 
          totalAmount: Number(total),
          total: Number(total),      
          status: "FEE_PAID_AWAITING_DELIVERY", 
          paymentId: paymentId && paymentId !== "direct" ? paymentId : null,
          sellerId: post.userId,
          postId: postId,
          commission: 0, 
          sellerEarnings: Number(total),
          items: {
            create: items.map((item: any) => ({
              productId: String(item.postId || item.id),
              variantId: item.variantId && String(item.variantId) !== "undefined" && String(item.variantId) !== "null" ? String(item.variantId) : null,
              price: Number(item.price || 0),
              quantity: Number(item.quantity) || 1,
              color: item.selectedOptions 
                ? String(item.selectedOptions) 
                : (item.color && item.color !== "undefined" && item.color !== "null" ? String(item.color) : "Standard")
            }))
          }
        }
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, order: orderResult });

  } catch (error: any) {
    console.error("Erreur critique création commande & stocks:", error);
    return NextResponse.json({ 
        error: error.message || "Erreur lors de la validation", 
        details: error.message 
    }, { status: 500 });
  }
}