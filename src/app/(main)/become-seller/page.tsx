"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft,
  Sparkles, MessageCircle, Facebook, Instagram, Music2, Phone,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    label: "Commerce de proximité",
    sub: "Connexion humaine, vente réelle",
    svg: `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <clipPath id="circleView1"><circle cx="100" cy="160" r="60"/></clipPath>
        <clipPath id="circleView2"><circle cx="300" cy="160" r="60"/></clipPath>
      </defs>
      <rect width="400" height="320" fill="#060C18"/>
      
      <!-- Photo Vendeur (côté gauche) -->
      <image x="40" y="100" width="120" height="120" xlink:href="https://images.pexels.com/photos/7621004/pexels-photo-7621004.jpeg" clip-path="url(#circleView1)" preserveAspectRatio="xMidYMid slice"/>
      
      <!-- Photo Acheteur (côté droit) -->
      <image x="240" y="100" width="120" height="120" xlink:href="https://media.istockphoto.com/id/1184265522/photo/small-business-owners.webp?s=1024x1024&w=is&k=20&c=4FE7gb25JGPGiRcYJBCCapVeDzqdI0FY-G-FmP9q3rk=" clip-path="url(#circleView2)" preserveAspectRatio="xMidYMid slice"/>
      
      <!-- Ligne de connexion animée -->
      <line x1="160" y1="160" x2="240" y2="160" stroke="#25D366" stroke-width="4" stroke-dasharray="10 5">
        <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1s" repeatCount="indefinite"/>
      </line>
    </svg>`,
  },
  {
    label: "Votre boutique, votre image",
    sub: "Soyez le visage de votre succès",
    svg: `<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="gradBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(6,12,24,0)"/>
          <stop offset="100%" stop-color="rgba(6,12,24,1)"/>
        </linearGradient>
      </defs>
      <!-- Image plein écran -->
      <image x="0" y="0" width="400" height="320" xlink:href="https://media.istockphoto.com/id/1460371157/photo/salesman-greeting-the-customer-on-a-street-market.jpg?s=612x612&w=0&k=20&c=248GPjywrEQpgT4kjxkYvccTo4k5FK9kWIRcK5WH4cM=" preserveAspectRatio="xMidYMid slice"/>
      
      <!-- Dégradé pour rendre le texte lisible sur l'image -->
      <rect x="0" y="0" width="400" height="320" fill="rgba(6,12,24,0.4)"/>
      <rect x="0" y="200" width="400" height="120" fill="url(#gradBottom)"/>
      
      <text x="200" y="270" fill="white" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Gérez vos ventes avec style</text>
    </svg>`
  }
];

export default function BecomeSellerPage() {
  const { user } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formDataValues, setFormDataValues] = useState({
    businessName: "", businessDomain: "", businessEmail: "", phoneNumber: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) router.push("/login?callbackUrl=/become-seller");
    else if (user.isSeller) router.push("/");
  }, [user, router]);

  useEffect(() => {
    const filled = Object.values(formDataValues).filter(v => v.trim() !== "").length;
    setFormProgress(Math.round((filled / 4) * 100));
  }, [formDataValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in formDataValues) setFormDataValues(prev => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    const phone = values.phoneNumber as string;
    if (phone && phone.length < 9) {
      toast({ variant: "destructive", description: "Numéro invalide." });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      toast({ description: "Boutique activée ! Bienvenue sur DealCity 🎉" });
      router.push("/");
      router.refresh();
    } catch {
      toast({ variant: "destructive", description: "Erreur. Réessayez." });
      setLoading(false);
    }
  }

  if (!user || user.isSeller) return null;

  return (
    <div className="fixed inset-0 z-50 flex w-screen h-dvh overflow-hidden bg-[#f8fbff] dark:bg-[#09090b]">

      {/* ✅ Colonne gauche — formulaire */}
      <div className="w-full lg:w-[48%] flex flex-col overflow-y-auto">
        <div className="px-6 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#4a90e2] dark:text-zinc-400 transition-all">
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
              <ArrowLeft className="size-4" />
            </div>
            <span>Retour</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-12 py-8 max-w-lg mx-auto w-full">
          <div className="mb-7 space-y-2">
            <div className="flex items-end gap-2.5">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#4a90e2] to-[#6ab344] bg-clip-text text-transparent">DealCity</span>
              <span className="text-xs font-black bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-wider">PRO</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50">Créez votre boutique</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Rejoignez des milliers de vendeurs au Cameroun</p>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4a90e2] to-[#6ab344] transition-all duration-500 rounded-full" style={{ width: `${formProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold">{formProgress}% complété</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1">
                <Briefcase className="size-3" /> Identité de la boutique
              </p>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input name="businessName" onChange={handleInputChange} placeholder="Nom de votre boutique" required className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input name="businessDomain" onChange={handleInputChange} placeholder="Domaine" required className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input name="businessEmail" type="email" onChange={handleInputChange} placeholder="Email" required className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-zinc-800" />

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                <Phone className="size-3" /> Contact & Réseaux
              </p>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                <Input name="phoneNumber" onChange={handleInputChange} placeholder="Numéro WhatsApp (237XXXXXXXXX)" required className="pl-10 rounded-xl border-emerald-300/50 bg-white dark:bg-zinc-800/60 focus-visible:ring-emerald-500 dark:border-zinc-700" />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input name="whatsappUrl" placeholder="Lien catalogue WhatsApp (Optionnel)" className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700" />
              </div>
              <div className="relative">
                <Music2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-600" />
                <Input name="tiktokUrl" placeholder="TikTok (Optionnel)" className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-600" />
                  <Input name="facebookUrl" placeholder="Facebook" className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700" />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-pink-500" />
                  <Input name="instagramUrl" placeholder="Instagram" className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700" />
                </div>
              </div>
              <div className="relative">
                <ShoppingBag className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <Textarea name="businessProducts" placeholder="Décrivez vos produits / services..." className="pl-10 rounded-xl min-h-[70px] resize-none bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2a629b] text-white font-black rounded-xl shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="animate-spin size-5" /><span>Création...</span></>
                : <><span>Créer ma boutique</span><span>🚀</span></>
              }
            </Button>

            <p className="text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="size-3 text-amber-500" />
              <span>Inscription gratuite · Sans engagement</span>
            </p>
          </form>
        </div>
      </div>

      {/* ✅ Colonne droite — illustrations */}
     <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-white">
  {/* Image de fond nette */}
  <AnimatePresence mode="wait">
    <motion.div
      key={currentSlide}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 w-full h-full"
    >
      <div 
        className="w-full h-full bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${
            currentSlide === 0 ? "https://images.pexels.com/photos/7621004/pexels-photo-7621004.jpeg" :
            currentSlide === 1 ? "https://images.pexels.com/photos/6969967/pexels-photo-6969967.jpeg" :
            "https://media.istockphoto.com/id/1460371157/photo/salesman-greeting-the-customer-on-a-street-market.jpg?s=612x612&w=0&k=20&c=248GPjywrEQpgT4kjxkYvccTo4k5FK9kWIRcK5WH4cM="
          })`
        }}
      />
    </motion.div>
  </AnimatePresence>

  {/* Effet "Neige" alternant WhatsApp et Téléphone */}
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(8)].map((_, i) => {
      const isPhone = i % 2 === 0; // Alternance entre les deux icônes
      return (
        <motion.div
          key={i}
          className={`absolute ${isPhone ? "text-white" : "text-[#25D366]"}`}
          initial={{ top: -50, left: `${Math.random() * 100}%` }}
          animate={{ top: "110%" }}
          transition={{ 
            duration: 8 + Math.random() * 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          {isPhone ? (
            <Phone className="size-7 drop-shadow-md" />
          ) : (
            <MessageCircle className="size-8 drop-shadow-md" />
          )}
        </motion.div>
      );
    })}
  </div>

  {/* Zone de texte */}
  <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/70 to-transparent">
    <motion.h2 
      key={`label-${currentSlide}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-3xl font-black text-white"
    >
      {slides[currentSlide].label}
    </motion.h2>
    <p className="text-white/90 font-medium text-lg">{slides[currentSlide].sub}</p>
  </div>
</div>
    </div>
  );
}