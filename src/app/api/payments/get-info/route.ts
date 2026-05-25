import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');

  if (!ref || ref === 'null') return NextResponse.json({ error: "Ref manquante" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: ref } });
  if (!payment) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  // Extraction propre des données stockées dans ton champ 'note'
  const note = payment.note || "";
  const name = note.match(/Client: (.*?) \|/)?.[1] || "";
  const phone = note.match(/Tel: (.*?) \|/)?.[1] || "";
  const productJson = note.match(/Product: (.*)/)?.[1];

  return NextResponse.json({ 
    name, 
    phone, 
    product: productJson ? JSON.parse(productJson) : null 
  });
}