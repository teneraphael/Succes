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
        total: totalAmount,
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
    formData.append("item_ref", order.id);
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

    // 7. GESTION DE LA RÉPONSE (CORRIGÉE)

    // CAS A : Redirection externe (Lien de paiement)
    if (data.payment_url) {
      return NextResponse.json({ url: data.payment_url });
    } 
    
    // CAS B : Succès - Le solde est suffisant et le "Push" est lancé
    if (data.status === "REQUEST_ACCEPTED" || data.message === "payment pending") {
      return NextResponse.json({ 
        success: true,
        message: "Session ouverte ! Saisissez votre code PIN sur votre téléphone pour valider.",
        ussd: data.channel_ussd || "#150*50#" 
      });
    }

    // CAS C : ÉCHEC SPÉCIFIQUE (Solde insuffisant)
    // Monetbil renvoie souvent 402 ou un message contenant "balance"
    const isInsufficient = data.code === 402 || 
                           data.status === "REQUEST_FAILED" && 
                           data.message?.toLowerCase().includes("balance");

    if (isInsufficient) {
      return NextResponse.json({ 
        error: "Solde insuffisant ! Rechargez votre compte Orange/MTN et réessayez.",
        step: "RECHARGE"
      }, { status: 402 });
    }

    // CAS D : Autre erreur (Numéro invalide, etc.)
    console.error("Détails Erreur Monetbil:", data);
    return NextResponse.json({ 
      error: data.message || "Impossible d'initier le paiement. Vérifiez votre numéro ou votre solde." 
    }, { status: 400 });

  } catch (error) {
    console.error("Erreur Checkout Interne:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}