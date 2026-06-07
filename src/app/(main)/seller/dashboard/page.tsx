import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, getUserDataSelect } from "@/lib/types";
import { redirect } from "next/navigation";
import SellerDashboard from "./SellerDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de Bord — DealCity",
};

export default async function Page() {
  const { user: sessionUser } = await validateRequest();
  if (!sessionUser) redirect("/login");

  const fullUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: getUserDataSelect(sessionUser.id),
  });

  if (!fullUser || !fullUser.isSeller) redirect("/");

  const sellerPosts = await prisma.post.findMany({
    where: { userId: fullUser.id },
    include: getPostDataInclude(fullUser.id),
    orderBy: { createdAt: "desc" },
  });

  // ✅ Stats mensuelles calculées côté serveur pour le dashboard
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const postIds = sellerPosts.map((p) => p.id);

  const [
    viewsThisMonth,
    viewsLastMonth,
    whatsappThisMonth,
    whatsappLastMonth,
    likesThisMonth,
    likesLastMonth,
    commentsThisMonth,
    commentsLastMonth,
  ] = await Promise.all([
    // Vues ce mois
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "VIEW", createdAt: { gte: startOfCurrentMonth } },
    }),
    // Vues mois précédent
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "VIEW", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    // Clics WhatsApp ce mois
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "CHAT", createdAt: { gte: startOfCurrentMonth } },
    }),
    // Clics WhatsApp mois précédent
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "CHAT", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    // Likes ce mois
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "FAVORITE", createdAt: { gte: startOfCurrentMonth } },
    }),
    // Likes mois précédent
    prisma.userInteraction.count({
      where: { postId: { in: postIds }, type: "FAVORITE", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    // Commentaires ce mois
    prisma.comment.count({
      where: { postId: { in: postIds }, createdAt: { gte: startOfCurrentMonth } },
    }),
    // Commentaires mois précédent
    prisma.comment.count({
      where: { postId: { in: postIds }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
  ]);

  // ✅ Calcul variation %
  const calcVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const monthlyStats = {
    views: { current: viewsThisMonth, previous: viewsLastMonth, variation: calcVariation(viewsThisMonth, viewsLastMonth) },
    whatsapp: { current: whatsappThisMonth, previous: whatsappLastMonth, variation: calcVariation(whatsappThisMonth, whatsappLastMonth) },
    likes: { current: likesThisMonth, previous: likesLastMonth, variation: calcVariation(likesThisMonth, likesLastMonth) },
    comments: { current: commentsThisMonth, previous: commentsLastMonth, variation: calcVariation(commentsThisMonth, commentsLastMonth) },
    totalViews: sellerPosts.reduce((acc, p) => acc + (p.views || 0), 0),
    totalLikes: sellerPosts.reduce((acc, p) => acc + p._count.likes, 0),
    totalProducts: sellerPosts.length,
  };

  return <SellerDashboard posts={sellerPosts} user={fullUser} monthlyStats={monthlyStats} />;
}