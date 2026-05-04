"use client";

import { usePost } from "@/hooks/use-post";
import { X, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { use, useEffect } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function PostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // ✅ Déballage Next.js 15
  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  // ✅ EMPECHE LE REFRESH / PERTE DE SCROLL
  // On bloque le scroll du body quand la vue est ouverte pour "fixer" la position en arrière-plan
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white size-10" />
      </div>
    );
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

  const visualAttachments = post.attachments.filter((a: any) => a.type !== "AUDIO");

  const handleQuickBuy = () => {
    const urlParams = new URLSearchParams({
      directId: post.id,
      name: post.productName || "Article DealCity",
      price: post.price?.toString() || "0",
      image: visualAttachments[0]?.url || "",
      qty: "1",
    });
    router.push(`/checkout?${urlParams.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
      
      {/* BOUTON FERMER - Utilise router.back() sans recharger */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-[110] p-2 bg-black/40 hover:bg-black/80 rounded-full text-white transition-all border border-white/10 active:scale-90"
      >
        <X className="size-6" />
      </button>

      {/* ZONE MÉDIAS - Bord à bord sur mobile */}
      <div className="flex-1 overflow-y-auto bg-black scrollbar-hide flex flex-col items-center snap-y snap-mandatory">
        <div className="w-full max-w-4xl">
          {visualAttachments.map((m: any, index: number) => (
            <div key={m.id} className="relative w-full h-[85vh] md:h-screen snap-center">
              <Image
                src={m.url}
                alt="Media DealCity"
                fill
                priority={index === 0}
                // ✅ Plein écran mobile, contenu entier sur Desktop
                className="object-cover md:object-contain"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ZONE INFOS - Uniquement Desktop */}
      <div className="hidden md:flex w-[400px] bg-card border-l border-border flex-col p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-sm font-black uppercase text-muted-foreground tracking-widest mb-4">
            Détails du Deal
          </h2>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-border/50">
            <Image
              src={post.user.avatarUrl || "/avatar-placeholder.png"}
              width={45}
              height={45}
              className="rounded-full aspect-square object-cover"
              alt={post.user.displayName}
            />
            <div>
              <p className="font-bold text-sm leading-none">{post.user.displayName}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">
                Vendeur Certifié
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-auto">
          <h1 className="text-2xl font-black uppercase leading-tight">
            {post.productName || "Produit DealCity"}
          </h1>
          <div className="text-3xl font-mono font-black text-green-500">
            {post.price?.toLocaleString()} <span className="text-sm">FCFA</span>
          </div>
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-border">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {post.content.includes("📝") ? post.content.split("📝")[1] : post.content}
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
      </div>
    </div>
  );
}