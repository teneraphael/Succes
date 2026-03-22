import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user: buyer } = await validateRequest();
    if (!buyer) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { postId, price, name, phone, address, note } = await req.json();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, content: true } 
    });

    if (!post) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    const totalAmount = typeof price === 'string' ? parseInt(price) : price;
    const commission = Math.round(totalAmount * 0.05); 
    const sellerEarnings = totalAmount - commission;

    // SÉCURITÉ : On utilise "INITIALIZED". Le livreur ne verra PAS cette commande.
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
        notes: note || "", 
        status: "INITIALIZED", 
      },
    });

    const formData = new URLSearchParams();
    formData.append("service", process.env.MONETBIL_SERVICE_KEY!);
    formData.append("amount", totalAmount.toString());
    formData.append("phonenumber", phone);
    formData.append("item_ref", order.id);
    formData.append("payment_phrase", `DealCity: ${post.content?.substring(0, 25)}`);
    formData.append("currency", "XAF");
    formData.append("notify_url", `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/monetbil`);
    formData.append("return_url", `${process.env.NEXT_PUBLIC_BASE_URL}/users/${buyer.username}?tab=orders`);

    const response = await fetch("https://api.monetbil.com/payment/v1/placePayment", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.payment_url) return NextResponse.json({ url: data.payment_url });
    
    if (data.status === "REQUEST_ACCEPTED" || data.message === "payment pending") {
      return NextResponse.json({ 
        success: true,
        message: "Session ouverte ! Validez sur votre téléphone.",
        ussd: data.channel_ussd || "#150*50#" 
      });
    }

    return NextResponse.json({ error: data.message || "Erreur d'initialisation" }, { status: 400 });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}