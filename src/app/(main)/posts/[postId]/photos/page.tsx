"use client";

import { usePost } from "@/hooks/use-post";
import { X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { use, useEffect } from "react";
import { motion } from "framer-motion"; // Nécessite : npm install framer-motion

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function PostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // ✅ EFFET "ZERO LOADING" : Si on charge encore, on affiche un fond noir vide 
  // pour laisser l'animation Shared Element se faire sans spinner moche.
  if (isLoading && !post) {
    return <div className="fixed inset-0 z-[100] bg-black" />;
  }

  if (error || !post) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white p-4">
        <p>Impossible de charger les images.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">
          Retourner au flux
        </button>
      </div>
    );
  }

  // ✅ Cast local en any pour éviter l'erreur TS2339 sur productName et price
  const postData = post as any;

  const visualAttachments = postData.attachments.filter((a: any) => a.type !== "AUDIO");

  const handleQuickBuy = () => {
    const urlParams = new URLSearchParams({
      directId: postData.id,
      name: postData.productName || "Article DealCity",
      price: postData.price?.toString() || "0",
      image: visualAttachments[0]?.url || "",
      qty: "1",
    });
    router.push(`/checkout?${urlParams.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden"
    >
      
      {/* BOUTON FERMER */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-[110] p-2 bg-black/40 hover:bg-black/80 rounded-full text-white transition-all border border-white/10 active:scale-90 backdrop-blur-md"
      >
        <X className="size-6" />
      </button>

      {/* ZONE MÉDIAS - L'effet de "détachement" est ici */}
      <div className="flex-1 overflow-y-auto bg-black scrollbar-hide flex flex-col items-center snap-y snap-mandatory">
        <div className="w-full max-w-4xl">
          {visualAttachments.map((m: any, index: number) => (
            <motion.div 
              key={m.id} 
              // ✅ CRUCIAL: Le layoutId doit être identique à celui de l'image dans ton PostCard
              layoutId={`post-image-${m.id}`}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full h-[85vh] md:h-screen snap-center"
            >
              <Image
                src={m.url}
                alt="Media DealCity"
                fill
                priority={index === 0}
                className="object-contain" // Contain pour voir l'article entier sans rognage
                sizes="(max-width: 768px) 100vw, 70vw"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ZONE INFOS - Apparition latérale fluide */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="hidden md:flex w-[400px] bg-card border-l border-border flex-col p-6 overflow-y-auto"
      >
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase text-muted-foreground tracking-widest mb-4">
            Détails du Deal
          </h2>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-border/50">
            <Image
              src={postData.user.avatarUrl || "/avatar-placeholder.png"}
              width={45}
              height={45}
              className="rounded-full aspect-square object-cover"
              alt={postData.user.displayName}
            />
            <div>
              <p className="font-bold text-sm leading-none">{postData.user.displayName}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">
                Vendeur Certifié
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-auto">
          <h1 className="text-2xl font-black uppercase leading-tight">
            {postData.productName || "Produit DealCity"}
          </h1>
          <div className="text-3xl font-mono font-black text-green-500">
            {postData.price?.toLocaleString()} <span className="text-sm">FCFA</span>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-border">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {postData.content.includes("📝") ? postData.content.split("📝")[1] : postData.content}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleQuickBuy}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-sm shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <ShoppingBag className="size-5" />
            Acheter maintenant
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}