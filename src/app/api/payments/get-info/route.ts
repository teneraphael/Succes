import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');

    if (!ref || ref === 'null') {
      return NextResponse.json({ error: "Ref manquante" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ 
      where: { id: ref } 
    });

    if (!payment) {
      return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 });
    }

    const note = payment.note || "";
    
    // Découpage sécurisé de la note (Format attendu : Client:Nom|Tel:000|Product:Base64)
    const parts = note.split('|');
    
    const name = parts.find(p => p.startsWith('Client:'))?.replace('Client:', '') || "";
    const phone = parts.find(p => p.startsWith('Tel:'))?.replace('Tel:', '') || "";
    const productBase64 = parts.find(p => p.startsWith('Product:'))?.replace('Product:', '');

    let productData = null;
    
    if (productBase64) {
      try {
        // Décodage du Base64 vers JSON pour récupérer la couleur et la quantité
        const jsonString = Buffer.from(productBase64, 'base64').toString('utf-8');
        productData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Erreur lors du décodage du produit:", e);
      }
    }

    return NextResponse.json({ 
      name, 
      phone, 
      product: productData 
    });

  } catch (error) {
    console.error("Erreur serveur API get-info:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}