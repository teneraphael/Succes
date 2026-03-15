import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Vérification de l'utilisateur
    const { user: buyer } = await validateRequest();
    if (!buyer) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { postId, price, name, phone, address } = await req.json();

    // 2. Vérification du produit
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, content: true } 
    });

    if (!post) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // 3. Calcul des montants et commissions
    const totalAmount = parseInt(price);
    const commission = Math.round(totalAmount * 0.05); // 5% de commission
    const sellerEarnings = totalAmount - commission;

    // 4. Création de la commande dans Prisma
    const order = await prisma.order.create({
      data: {
        userId: buyer.id,
        sellerId: post.userId,
        postId: postId,
        totalAmount: totalAmount,
        total: totalAmount, // Ajouté car obligatoire dans ton schéma
        commission: commission,
        sellerEarnings: sellerEarnings,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        status: "PENDING",
      },
    });

    // 5. Préparation de la requête pour Monetbil
    const formData = new URLSearchParams();
    formData.append("service", process.env.MONETBIL_SERVICE_KEY!);
    formData.append("amount", totalAmount.toString());
    formData.append("phonenumber", phone);
    formData.append("item_ref", order.id); // Utilisé par le Webhook pour identifier la commande
    formData.append("payment_phrase", `DealCity: ${post.content?.substring(0, 30)}`);
    formData.append("currency", "XAF");
    formData.append("notify_url", `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/monetbil`);
    formData.append("return_url", `${process.env.NEXT_PUBLIC_BASE_URL}/users/${buyer.username}?tab=orders`);

    // 6. Envoi de la requête à l'API Monetbil
    const response = await fetch("https://api.monetbil.com/payment/v1/placePayment", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: formData.toString(),
    });

    const data = await response.json();

    // 7. Gestion de la réponse Monetbil
    if (data.payment_url) {
      // Cas classique (souvent MTN) : on redirige vers l'URL
      return NextResponse.json({ url: data.payment_url });
    } 
    
    if (data.status === "REQUEST_ACCEPTED" || data.message === "payment pending") {
      // Cas Orange Money : l'utilisateur doit valider sur son téléphone
      return NextResponse.json({ 
        success: true,
        message: "Veuillez valider le paiement sur votre téléphone.",
        ussd: data.channel_ussd || "#150*50#" 
      });
    }

    // Si on arrive ici, c'est que Monetbil a renvoyé une erreur réelle
    console.error("Détails Erreur Monetbil:", data);
    return NextResponse.json({ 
      error: data.message || "Erreur lors de l'initialisation du paiement" 
    }, { status: 400 });

  } catch (error) {
    console.error("Erreur Checkout Interne:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}