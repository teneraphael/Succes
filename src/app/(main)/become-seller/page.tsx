"use client";

import { useState, useEffect, useTransition } from "react";
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
    image: "https://images.pexels.com/photos/7621004/pexels-photo-7621004.jpeg",
  },
  {
    label: "Votre vitrine digitale",
    sub: "Développez votre clientèle en ligne",
    image: "https://images.pexels.com/photos/6969967/pexels-photo-6969967.jpeg",
  },
  {
    label: "Votre boutique, votre image",
    sub: "Soyez le visage de votre succès",
    image: "https://media.istockphoto.com/id/1460371157/photo/salesman-greeting-the-customer-on-a-street-market.jpg?s=612x612&w=0&k=20&c=248GPjywrEQpgT4kjxkYvccTo4k5FK9kWIRcK5WH4cM=",
  }
];

export default function BecomeSellerPage() {
  const { user } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isPending, startTransition] = useTransition();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [formDataValues, setFormDataValues] = useState({
    businessName: "", 
    businessDomain: "", 
    businessEmail: "", 
    phoneNumber: "",
  });

  // Rotation des diapositives d'illustration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Redirections de sécurité
  useEffect(() => {
    if (!user) {
      router.push("/login?callbackUrl=/become-seller");
    } else if (user.isSeller) {
      router.push("/");
    }
  }, [user, router]);

  // Calcul dynamique de la progression du formulaire
  useEffect(() => {
    const filled = Object.values(formDataValues).filter((v) => v.trim() !== "").length;
    setFormProgress(Math.round((filled / 4) * 100));
  }, [formDataValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in formDataValues) {
      setFormDataValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const phone = data.get("phoneNumber") as string;

    if (phone && phone.length < 9) {
      toast({ variant: "destructive", description: "Numéro de téléphone invalide." });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/users/become-seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(data.entries())),
        });

        if (!res.ok) throw new Error();

        toast({ description: "Boutique activée ! Bienvenue sur DealCity 🎉" });
        router.push("/");
        router.refresh();
      } catch {
        toast({ variant: "destructive", description: "Une erreur est survenue. Veuillez réessayer." });
      }
    });
  }

  if (!user || user.isSeller) return null;

  return (
    <div className="fixed inset-0 z-50 flex w-screen h-dvh overflow-hidden bg-[#f8fbff] dark:bg-[#09090b]">

      {/* ── COLONNE GAUCHE : Formulaire d'inscription ── */}
      <div className="w-full lg:w-[48%] flex flex-col overflow-y-auto">
        <div className="px-6 pt-6 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#4a90e2] dark:text-zinc-400 transition-all"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
              <ArrowLeft className="size-4" />
            </div>
            <span>Retour</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-12 py-8 max-w-lg mx-auto w-full">
          <div className="mb-7 space-y-2">
            <div className="flex items-end gap-2.5">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#4a90e2] to-[#6ab344] bg-clip-text text-transparent">
                DealCity
              </span>
              <span className="text-xs font-black bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-wider">
                PRO
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
              Créez votre boutique
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Rejoignez des milliers de vendeurs au Cameroun
            </p>

            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4a90e2] to-[#6ab344] transition-all duration-500 rounded-full"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold">{formProgress}% complété</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Identité */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1">
                <Briefcase className="size-3" /> Identité de la boutique
              </p>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  name="businessName"
                  value={formDataValues.businessName}
                  onChange={handleInputChange}
                  placeholder="Nom de votre boutique"
                  required
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    name="businessDomain"
                    value={formDataValues.businessDomain}
                    onChange={handleInputChange}
                    placeholder="Domaine d'activité"
                    required
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    name="businessEmail"
                    type="email"
                    value={formDataValues.businessEmail}
                    onChange={handleInputChange}
                    placeholder="Email professionnel"
                    required
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-zinc-800" />

            {/* Contact & Réseaux */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                <Phone className="size-3" /> Contact & Réseaux Sociaux
              </p>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                <Input
                  name="phoneNumber"
                  value={formDataValues.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Numéro WhatsApp (ex: 2376XXXXXXXX)"
                  required
                  className="pl-10 rounded-xl border-emerald-300/50 bg-white dark:bg-zinc-800/60 focus-visible:ring-emerald-500 dark:border-zinc-700"
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  name="whatsappUrl"
                  placeholder="Lien catalogue WhatsApp (Optionnel)"
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div className="relative">
                <Music2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-600 dark:text-zinc-300" />
                <Input
                  name="tiktokUrl"
                  placeholder="Lien TikTok (Optionnel)"
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-600" />
                  <Input
                    name="facebookUrl"
                    placeholder="Facebook"
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-pink-500" />
                  <Input
                    name="instagramUrl"
                    placeholder="Instagram"
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div className="relative">
                <ShoppingBag className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <Textarea
                  name="businessProducts"
                  placeholder="Décrivez brièvement vos produits / services..."
                  className="pl-10 rounded-xl min-h-[70px] resize-none bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2a629b] text-white font-black rounded-xl shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin size-5" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <span>Créer ma boutique</span>
                  <span>🚀</span>
                </>
              )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 pb-4">
              <Sparkles className="size-3 text-amber-500" />
              <span>Inscription gratuite · Sans engagement</span>
            </p>
          </form>
        </div>
      </div>

      {/* ── COLONNE DROITE : Visuels animés & Animations ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
        </AnimatePresence>

        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Animation de particules flottantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => {
            const isPhone = i % 2 === 0;
            return (
              <motion.div
                key={i}
                className={`absolute ${isPhone ? "text-white/40" : "text-[#25D366]/60"}`}
                initial={{ top: "-10%", left: `${15 + i * 15}%` }}
                animate={{ top: "110%" }}
                transition={{
                  duration: 9 + (i % 3) * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.2,
                }}
              >
                {isPhone ? <Phone className="size-6 drop-shadow-lg" /> : <MessageCircle className="size-7 drop-shadow-lg" />}
              </motion.div>
            );
          })}
        </div>

        {/* Titre dynamique de la diapositive */}
        <div className="absolute inset-x-0 bottom-0 p-12 space-y-1 z-10">
          <motion.h2
            key={`label-${currentSlide}`}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            {slides[currentSlide].label}
          </motion.h2>
          <motion.p
            key={`sub-${currentSlide}`}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-white/80 font-medium text-base"
          >
            {slides[currentSlide].sub}
          </motion.p>
        </div>
      </div>
    </div>
  );
}