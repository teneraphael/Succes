"use client";

import { usePost } from "@/hooks/use-post";
import { X, ShoppingBag, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const descMatch = content.match(/📝\s*DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|$)/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : content,
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

export default function PostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (isLoading && !post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-end gap-[4px]">
            <div className="w-[6px] h-5 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
            <div className="w-[6px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
            <div className="w-[6px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
            <div className="w-[6px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
          </div>
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Chargement...
          </span>
        </div>
      </motion.div>
    );
  }

  if (error || !post) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center gap-4 p-4">
        <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center">
          <ShoppingBag className="size-6 text-white/40" />
        </div>
        <p className="text-sm font-bold text-white/60">
          Impossible de charger les images.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full bg-[#4a90e2] text-white text-xs font-black uppercase tracking-widest hover:bg-[#357abd] transition-all active:scale-95"
        >
          Retour
        </button>
      </div>
    );
  }

  const postData = post as any;
  const visualAttachments = postData.attachments.filter((a: any) => a.type !== "AUDIO");
  const { productName, price, description } = extractInfo(postData.content);

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col md:flex-row overflow-hidden"
      >
        {/* Bouton fermer */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
          onClick={() => router.back()}
          className="absolute top-5 left-5 z-[110] p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all active:scale-90 border border-white/10"
        >
          <X className="size-5" />
        </motion.button>

        {/* Galerie */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 scrollbar-hide flex flex-col items-center snap-y snap-mandatory">
          <div className="w-full max-w-4xl">
            {visualAttachments.map((m: any, index: number) => (
              <motion.div
                key={m.id}
                layoutId={`post-image-${m.id}`}
                style={{ borderRadius: index === 0 ? 0 : undefined }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-[85vh] md:h-screen snap-center"
              >
                <Image
                  src={m.url}
                  alt={productName || "Produit DealCity"}
                  fill
                  priority={index === 0}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 70vw"
                  unoptimized={isExternalImage(m.url)}
                />

                {/* Compteur */}
                {visualAttachments.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10">
                    {index + 1} / {visualAttachments.length}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Panneau infos desktop */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 24 }}
          className="hidden md:flex w-[400px] bg-zinc-900 border-l border-white/8 flex-col p-6 overflow-y-auto gap-6"
        >
          {/* Vendeur */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/8">
            <Image
              src={postData.user.avatarUrl || "/icons/icon-192.png"}
              width={44}
              height={44}
              className="rounded-full aspect-square object-cover ring-2 ring-[#4a90e2]/30"
              alt={postData.user.displayName}
              unoptimized={isExternalImage(postData.user.avatarUrl || "")}
            />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-none truncate">
                {postData.user.displayName}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="size-3 text-[#4a90e2]" />
                <span className="text-[9px] text-[#4a90e2] font-black uppercase tracking-widest">
                  Vendeur DealCity
                </span>
              </div>
            </div>
          </div>

          {/* Nom + prix */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">
              {productName || "Produit DealCity"}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#6ab344] font-mono">
                {price ? parseInt(price).toLocaleString() : "—"}
              </span>
              <span className="text-sm font-bold text-[#6ab344]/70">FCFA</span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/8 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                Description
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* Badge DealCity */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/8">
            <div className="flex items-end gap-[3px]">
              <div className="w-[5px] h-3 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-5 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-6 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-4 bg-[#4a90e2] rounded-sm" />
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              DealCity
            </span>
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}