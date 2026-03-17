import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}