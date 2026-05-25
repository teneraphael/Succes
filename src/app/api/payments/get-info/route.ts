import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');

    if (!ref || ref === 'null') {
      return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
    }

    // Récupération sécurisée avec gestion d'erreurs Prisma
    const payment = await prisma.payment.findUnique({ 
      where: { id: ref },
      select: { note: true, status: true } // Ne sélectionnez que ce dont vous avez besoin
    });

    if (!payment) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    // Sécurisation du parsing : on traite la note uniquement si elle existe
    const note = payment.note || "";
    
    // Suggestion : Pour éviter le split('|'), si vous avez le contrôle,
    // préférez stocker directement un JSON dans le champ 'note'.
    const parts = note.split('|');
    
    const name = parts.find(p => p.startsWith('Client:'))?.split('Client:')[1] || "";
    const phone = parts.find(p => p.startsWith('Tel:'))?.split('Tel:')[1] || "";
    const productBase64 = parts.find(p => p.startsWith('Product:'))?.split('Product:')[1];

    let productData = null;
    if (productBase64) {
      try {
        const jsonString = Buffer.from(productBase64, 'base64').toString('utf-8');
        productData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Format de produit corrompu:", e);
      }
    }

    return NextResponse.json({ 
      name, 
      phone, 
      product: productData 
    });

  } catch (error) {
    console.error("Erreur API get-info:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}