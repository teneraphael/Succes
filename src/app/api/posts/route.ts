import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { moderatePostContent } from "@/lib/moderation";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, city, neighborhood, mediaIds, stock, targetUserId } = body;

    // 1️⃣ Récupération des URLs et des types des médias depuis les IDs envoyés par le PostEditor
    let mediaUrls: { url: string; type: "IMAGE" | "VIDEO" }[] = [];
    if (mediaIds && mediaIds.length > 0) {
      const mediaRecords = await prisma.media.findMany({
        where: { id: { in: mediaIds } },
        select: { url: true, type: true },
      });
      
      // On s'assure que le type correspond bien à ce qu'attend la modération ("IMAGE" | "VIDEO")
      mediaUrls = mediaRecords.map((m) => ({
        url: m.url,
        type: (m.type === "VIDEO" ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO",
      }));
    }

    // 2️⃣ 🤖 MODÉRATION AUTOMATIQUE PAR IA (Vente obligatoire + Photos réelles sans filigrane)
    const moderation = await moderatePostContent(content, mediaUrls);

    if (!moderation.isAllowed) {
      return Response.json(
        { 
          error: "Publication refusée", 
          reason: moderation.reason || "Votre annonce ne respecte pas les règles de DealCity (vente obligatoire, pas de filigrane, etc.)." 
        }, 
        { status: 400 }
      );
    }

    // 3️⃣ Gestion de la substitution admin (si l'admin publie pour un pionnier)
    const authorId = 
      (user.username === "dealcity" || user.id === "22lmc64bcqwsqybu") && targetUserId && targetUserId !== "me"
        ? targetUserId
        : user.id;

    // 4️⃣ 📝 Création du post en base de données avec liaison des médias
    const newPost = await prisma.post.create({
      data: {
        content: content.trim(),
        city: city?.trim() || "",
        neighborhood: neighborhood?.trim() || "",
        stock: typeof stock === "number" ? stock : parseInt(stock) || 1,
        userId: authorId,
        attachments: {
          connect: mediaIds.map((id: string) => ({ id })),
        },
      },
      include: {
        user: true,
        attachments: true,
      },
    });

    console.log("✅ Post validé par l'IA et créé avec succès :", newPost.id);

    return Response.json(newPost, { status: 201 });
  } catch (error) {
    console.error("ERREUR CRITIQUE CRÉATION POST:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}