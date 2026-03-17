import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    const { orderId } = await params;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}