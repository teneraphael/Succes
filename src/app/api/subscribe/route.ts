import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fcmToken } = await req.json();

    if (!fcmToken || typeof fcmToken !== "string") {
      return Response.json({ error: "Invalid FCM token provided" }, { status: 400 });
    }

    // Mettre à jour le champ fcmToken de l'utilisateur
    await prisma.user.update({
      where: { id: loggedInUser.id },
      data: { fcmToken },
    });
    return new Response(null, { status: 200 });
    
  } catch (error) {
    console.error("Error subscribing user to notifications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
