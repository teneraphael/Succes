"use client";

import { usePost } from "@/hooks/use-post";
import { X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { use, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function InterceptedPostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (error || (!isLoading && !post)) {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center text-white p-4">
        <p>Erreur de chargement.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-primary underline"
        >
          Fermer
        </button>
      </div>
    );
  }

  // FIX 1 : Fond semi-transparent + blur au lieu du noir opaque,
  // pour ne pas masquer l'animation de "détachement" pendant le fetch.
  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
      />
    );
  }

  const postData = post as any;
  const visualAttachments = postData.attachments.filter(
    (a: any) => a.type !== "AUDIO"
  );

  return (
    // FIX 2 : LayoutGroup synchronise les layoutId de cette page
    // avec ceux du feed (PostCard), même sur des routes différentes.
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden"
      >
        {/* BOUTON FERMER — apparaît après l'animation de l'image */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 24 }}
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-[120] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all active:scale-90 border border-white/20"
        >
          <X className="size-6" />
        </motion.button>

        {/* GALERIE MÉDIAS */}
        <div className="flex-1 overflow-y-auto bg-black scrollbar-hide flex flex-col items-center snap-y snap-mandatory">
          <div className="w-full max-w-5xl">
            {visualAttachments.map((m: any, index: number) => (
              // FIX 3 : style borderRadius pour animer la forme (arrondi → plein écran).
              // stiffness 300 / damping 30 = snap élastique façon WhatsApp.
              // Le layoutId DOIT être identique à celui du PostCard dans le feed.
              <motion.div
                key={m.id}
                layoutId={`post-image-${m.id}`}
                style={{ borderRadius: index === 0 ? 0 : undefined }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="relative w-full h-[85vh] md:h-screen snap-center"
              >
                <Image
                  src={m.url}
                  alt="Produit DealCity"
                  fill
                  priority={index === 0}
                  className="object-cover md:object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* PANNEAU INFOS — glisse depuis la droite après l'image */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 260,
            damping: 24,
          }}
          className="hidden md:flex w-[450px] bg-zinc-950 border-l border-white/10 flex-col p-8 overflow-y-auto text-white"
        >
          <div className="mb-10">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10">
              <Image
                src={postData.user.avatarUrl || "/avatar-placeholder.png"}
                width={50}
                height={50}
                className="rounded-full aspect-square object-cover"
                alt={postData.user.displayName}
              />
              <div>
                <p className="font-bold text-lg leading-none">
                  {postData.user.displayName}
                </p>
                <p className="text-[11px] text-green-400 mt-1 uppercase font-black tracking-widest">
                  Vendeur Certifié
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-auto">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                {postData.productName || "Article Sans Nom"}
              </h1>
              <div className="text-4xl font-mono font-black text-green-500">
                {postData.price?.toLocaleString()}{" "}
                <span className="text-lg">FCFA</span>
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-sm leading-relaxed text-zinc-400">
                {postData.content.includes("📝")
                  ? postData.content.split("📝")[1]
                  : postData.content}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}