import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import PostPageHeader from "./PostPageHeader";
import PostPageFooter from "./PostPageFooter";

export const metadata: Metadata = {
  title: "Publier une annonce — DealCity",
};

export default async function Page() {
  const { user } = await validateRequest();

  if (!user || !user.isSeller) {
    redirect("/");
  }

  return (
    <main className="flex w-full justify-center px-4 py-8 min-h-screen bg-gradient-to-b from-[#f0f7ff] to-white dark:from-[#0a0f1a] dark:to-[#0a0a0a] transition-colors">
      <div className="w-full max-w-2xl space-y-7">

        {/* ✅ En-tête client traduit */}
        <PostPageHeader />

        {/* Conteneur éditeur */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4a90e2] to-[#6ab344] rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-700" />
          <div className="relative bg-card rounded-3xl p-4 md:p-7 shadow-xl border border-[#4a90e2]/10 dark:border-white/5">
            <PostEditor />
          </div>
        </div>

        {/* ✅ Footer client traduit */}
        <PostPageFooter />

      </div>
    </main>
  );
}