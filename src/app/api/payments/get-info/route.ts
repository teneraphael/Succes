import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const p_data_url = searchParams.get('p_data'); // On récupère le p_data depuis l'URL

    // 1. PRIORITÉ : Si p_data est dans l'URL, on l'utilise directement
    if (p_data_url) {
      try {
        const decoded = JSON.parse(Buffer.from(p_data_url, 'base64').toString('utf-8'));
        return NextResponse.json({ 
          name: "ok", 
          product: decoded, 
          source: "url_param",
          timestamp: Date.now() 
        }, { status: 200 });
      } catch (e) {
        console.error("Erreur décodage p_data URL:", e);
      }
    }

    // 2. FALLBACK : Si pas de p_data dans l'URL, on cherche dans la BDD
    if (!ref) {
      return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ 
      where: { id: ref },
      select: { note: true, createdAt: true } 
    });

    if (!payment) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    const note = payment.note || "";
    const parts = note.split('|');
    const productBase64 = parts.find(p => p.startsWith('Product:'))?.split('Product:')[1];

    let productData = null;
    if (productBase64) {
      try {
        const jsonString = Buffer.from(productBase64, 'base64').toString('utf-8');
        productData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Erreur parsing Base64 BDD:", e);
      }
    }

    return NextResponse.json({ 
      name: "ok", 
      product: productData, 
      source: "database",
      timestamp: Date.now() 
    }, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }
    });

  } catch (error) {
    console.error("Erreur API get-info:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}