export const dynamic = "force-dynamic";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { sendPushNotification } from "@/lib/push-notifications";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error("GET Follower Info Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const { userId } = await params;

    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (loggedInUser.id === userId) return Response.json({ error: "Cannot follow yourself" }, { status: 400 });

    // Transaction pour garantir l'intégrité
    await prisma.$transaction(async (tx) => {
      const existing = await tx.follow.findUnique({
        where: { followerId_followingId: { followerId: loggedInUser.id, followingId: userId } }
      });

      if (!existing) {
        await tx.follow.create({
          data: { followerId: loggedInUser.id, followingId: userId },
        });
        await tx.notification.create({
          data: { issuerId: loggedInUser.id, recipientId: userId, type: "FOLLOW" },
        });
      }
    });

    // Envoi push sans bloquer la réponse API
    sendPushNotification(
      userId,
      "Nouveau follower ! 👤",
      `${loggedInUser.displayName} commence à vous suivre.`
    ).catch((err) => console.error("Push Notification Failed:", err));

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("POST Follow Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const { userId } = await params;

    if (!loggedInUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: { followerId: loggedInUser.id, followingId: userId },
      }),
      prisma.notification.deleteMany({
        where: { issuerId: loggedInUser.id, recipientId: userId, type: "FOLLOW" },
      }),
    ]);

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("DELETE Follow Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}