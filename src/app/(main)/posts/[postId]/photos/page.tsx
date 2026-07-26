"use client";

import { usePost } from "@/hooks/use-post";
import { X, ShoppingBag, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useCallback } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  const descMatch = content.match(/DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|📞|🔗|$)/i);
  const whatsappMatch = content.match(/WHATSAPP\s*:\s*([^\n]+)/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim().replace(/\s/g, "") : null,
    cleanDescription: descMatch ? descMatch[1].trim() : content,
    whatsappNumber: whatsappMatch ? whatsappMatch[1].trim() : null,
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

async function trackInteraction(postId: string, type: "VIEW" | "CHAT" | "FAVORITE") {
  try {
    await fetch("/api/posts/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, type, itemType: "POST" }),
    });
  } catch {}
}

export default function PostPhotosPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { postId } = use(params);
  const { data: post, isLoading, error } = usePost(postId);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Déclaration du callback WhatsApp
  const handleWhatsApp = useCallback(async () => {
    if (!post) return;
    
    const postData = post as any;
    const { productName, price: defaultPrice, cleanDescription, whatsappNumber } = extractInfo(postData.content);
    const currentStock = postData.stock ?? 0;
    const isAvailable = currentStock > 0;

    if (!isAvailable) {
      toast({ variant: "destructive", description: t.product_unavailable, duration: 2000 });
      return;
    }
    const number = whatsappNumber || postData.user?.phoneNumber || postData.user?.phone || "";
    if (!number) {
      toast({ variant: "destructive", description: t.whatsapp_unavailable, duration: 2000 });
      return;
    }

    trackInteraction(postData.id, "CHAT");

    const origin = typeof window !== "undefined" ? window.location.origin : "https://dealcity.app";
    const postUrl = `${origin}/posts/${postData.id}`;
    const shortDesc = cleanDescription
      ? cleanDescription.length > 200 ? cleanDescription.slice(0, 200) + "..." : cleanDescription
      : null;

    const lines: string[] = [];
    lines.push("Bonjour ! 👋");
    lines.push(`Je suis interesse(e) par votre produit sur *DealCity* :`);
    lines.push("");
    lines.push(`*${productName || "Article"}*`);
    lines.push(`Prix : *${defaultPrice ? parseInt(defaultPrice).toLocaleString() : "—"} FCFA*`);
    if (shortDesc) { lines.push(""); lines.push("Description :"); lines.push(shortDesc); }
    lines.push("");
    lines.push("Voir le produit :");
    lines.push(postUrl);
    lines.push("");
    lines.push("Est-ce que ce produit est toujours disponible ? Merci !");

    const cleanNumber = number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }, [post, t, toast]);

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

if (!post) {
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
  const { productName, price, cleanDescription } = extractInfo(postData.content);
  const currentStock = postData.stock ?? 0;
  const isAvailable = currentStock > 0;

  // Icône SVG de WhatsApp partagée
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

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
        <div className="flex-1 overflow-y-auto bg-zinc-950 scrollbar-hide flex flex-col items-center snap-y snap-mandatory pb-24 md:pb-0">
          <div className="w-full max-w-4xl">
            {visualAttachments.map((m: any, index: number) => (
              <motion.div
                key={m.id}
                layoutId={`post-image-${m.id}`}
                style={{ borderRadius: index === 0 ? 0 : undefined }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-[80vh] md:h-screen snap-center"
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

        {/* Bouton WhatsApp flottant pour Mobile uniquement */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent md:hidden z-[110] flex justify-center">
          <button
            onClick={handleWhatsApp}
            disabled={!isAvailable}
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2.5 shadow-xl active:scale-95",
              isAvailable
                ? "bg-[#25D366] text-white hover:bg-[#20b858]"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50"
            )}
          >
            <WhatsAppIcon />
            {isAvailable ? t.chat_whatsapp : t.unavailable}
          </button>
        </div>

        {/* Panneau infos desktop */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 24 }}
          className="hidden md:flex w-[400px] bg-zinc-900 border-l border-white/8 flex-col p-6 overflow-y-auto gap-6 shrink-0"
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
          {cleanDescription && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/8 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                Description
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {cleanDescription}
              </p>
            </div>
          )}

          {/* Bouton WhatsApp Desktop */}
          <button
            onClick={handleWhatsApp}
            disabled={!isAvailable}
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98]",
              isAvailable
                ? "bg-[#25D366] hover:bg-[#20b858] text-white shadow-[#25D366]/10"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
            )}
          >
            <WhatsAppIcon />
            {isAvailable ? t.chat_whatsapp : t.unavailable}
          </button>

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