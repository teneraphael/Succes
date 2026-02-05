import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, getUserDataSelect } from "@/lib/types";
import { redirect } from "next/navigation";
import SellerDashboard from "./SellerDashboard";

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

  // NOTE: On ne met AUCUN container max-w-7xl ou SidebarVendeur ici.
  // On renvoie juste le Dashboard pur.
  return <SellerDashboard posts={sellerPosts} user={fullUser} />;
}