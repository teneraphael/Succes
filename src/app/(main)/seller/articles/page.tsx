import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { redirect } from "next/navigation";
import MyPostsClient from "./MyPostsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes Articles — DealCity",
};

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    include: getPostDataInclude(user.id),
    orderBy: { createdAt: "desc" },
  });

  // ✅ On passe directement à MyPostsClient qui gère l'affichage complet
  return <MyPostsClient posts={posts} />;
}