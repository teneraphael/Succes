import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    for (const item of items) {
      // Utilisation d'une approche dynamique pour accéder au modèle 
      // afin de contourner l'erreur "Property 'product' does not exist"
      // Si votre modèle s'appelle 'Product' dans le schema, utilisez 'Product' ici
      const product = await (prisma as any).product.findUnique({
        where: { id: item.id },
      });

      // 2. Vérification de sécurité : existe-t-il ?
      if (!product) {
        return NextResponse.json(
          { valid: false, message: `L'article ${item.name || 'inconnu'} n'existe plus.` },
          { status: 404 }
        );
      }

      // 3. Vérification du stock
      const stock = typeof product.stock === 'number' ? product.stock : 0;
      const requestedQty = Number(item.quantity || 1);

      if (stock < requestedQty) {
        return NextResponse.json(
          { 
            valid: false, 
            message: `Stock insuffisant pour ${product.name}. Disponible: ${stock}` 
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Erreur check-stock:", error);
    return NextResponse.json(
      { valid: false, message: "Erreur serveur lors de la vérification du stock." },
      { status: 500 }
    );
  }
}