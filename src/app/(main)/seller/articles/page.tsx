import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { redirect } from "next/navigation";
import MyPostsClient from "./MyPostsClient";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    include: getPostDataInclude(user.id),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Mes Articles</h1>
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
          {posts.length} Produits
        </span>
      </div>
      
      <MyPostsClient posts={posts} />
    </div>
  );
}