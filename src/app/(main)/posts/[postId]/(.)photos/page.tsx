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

export default function InterceptedPostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // ✅ Déballage sécurisé pour Next.js 15
  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  // ✅ COMPORTEMENT MOBILE : Empêche le défilement du flux en arrière-plan
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-white size-10" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center text-white p-4">
        <p>Erreur de chargement.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">
          Fermer
        </button>
      </div>
    );
  }

  const visualAttachments = post.attachments.filter((a: any) => a.type !== "AUDIO");

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* BOUTON FERMER - Ferme l'interception sans recharger le flux */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-[120] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all active:scale-90 border border-white/20"
      >
        <X className="size-6" />
      </button>

      {/* GALERIE MÉDIAS - Plein écran mobile (Bord à bord) */}
      <div className="flex-1 overflow-y-auto bg-black scrollbar-hide flex flex-col items-center snap-y snap-mandatory">
        <div className="w-full max-w-5xl">
          {visualAttachments.map((m: any, index: number) => (
            <div key={m.id} className="relative w-full h-[85vh] md:h-screen snap-center">
              <Image
                src={m.url}
                alt="Produit DealCity"
                fill
                priority={index === 0}
                // ✅ object-cover sur mobile pour supprimer les bandes noires
                className="object-cover md:object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* PANNEAU INFOS - Uniquement visible sur Desktop */}
      <div className="hidden md:flex w-[450px] bg-zinc-950 border-l border-white/10 flex-col p-8 overflow-y-auto text-white">
        <div className="mb-10">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10">
            <Image
              src={post.user.avatarUrl || "/avatar-placeholder.png"}
              width={50}
              height={50}
              className="rounded-full aspect-square object-cover"
              alt={post.user.displayName}
            />
            <div>
              <p className="font-bold text-lg leading-none">{post.user.displayName}</p>
              <p className="text-[11px] text-green-400 mt-1 uppercase font-black tracking-widest">
                Vendeur Certifié
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-auto">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
              {post.productName || "Article Sans Nom"}
            </h1>
            <div className="text-4xl font-mono font-black text-green-500">
              {post.price?.toLocaleString()} <span className="text-lg">FCFA</span>
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-sm leading-relaxed text-zinc-400">
              {post.content.includes("📝") ? post.content.split("📝")[1] : post.content}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => {
              addToCart(post);
              toast({ description: "Ajouté au panier DealCity" });
            }}
            className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <ShoppingBag className="size-6" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}