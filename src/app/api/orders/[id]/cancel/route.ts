import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" }
  });

  return NextResponse.json({ success: true });
}