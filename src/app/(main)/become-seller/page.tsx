"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft,
  Sparkles, MessageCircle, Facebook, Instagram, Music2, Phone, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Motifs africains SVG inline — pas besoin d'images externes
const africanPatterns = [
  // Motif kente géométrique
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#0a1628"/>
    <rect x="0" y="0" width="50" height="50" fill="#4a90e2" opacity="0.3"/>
    <rect x="50" y="50" width="50" height="50" fill="#6ab344" opacity="0.3"/>
    <rect x="100" y="0" width="50" height="50" fill="#6ab344" opacity="0.3"/>
    <rect x="150" y="50" width="50" height="50" fill="#4a90e2" opacity="0.3"/>
    <rect x="0" y="100" width="50" height="50" fill="#6ab344" opacity="0.3"/>
    <rect x="100" y="100" width="50" height="50" fill="#4a90e2" opacity="0.3"/>
    <rect x="50" y="150" width="50" height="50" fill="#4a90e2" opacity="0.3"/>
    <rect x="150" y="150" width="50" height="50" fill="#6ab344" opacity="0.3"/>
    <line x1="0" y1="25" x2="200" y2="25" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
    <line x1="0" y1="75" x2="200" y2="75" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
    <line x1="0" y1="125" x2="200" y2="125" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
    <line x1="0" y1="175" x2="200" y2="175" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
    <line x1="25" y1="0" x2="25" y2="200" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
    <line x1="75" y1="0" x2="75" y2="200" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
    <line x1="125" y1="0" x2="125" y2="200" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
    <line x1="175" y1="0" x2="175" y2="200" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
    <circle cx="25" cy="25" r="8" fill="#4a90e2" opacity="0.6"/>
    <circle cx="75" cy="75" r="8" fill="#6ab344" opacity="0.6"/>
    <circle cx="125" cy="25" r="8" fill="#6ab344" opacity="0.6"/>
    <circle cx="175" cy="75" r="8" fill="#4a90e2" opacity="0.6"/>
    <circle cx="25" cy="125" r="8" fill="#6ab344" opacity="0.6"/>
    <circle cx="125" cy="125" r="8" fill="#4a90e2" opacity="0.6"/>
    <circle cx="75" cy="175" r="8" fill="#4a90e2" opacity="0.6"/>
    <circle cx="175" cy="175" r="8" fill="#6ab344" opacity="0.6"/>
  </svg>`,

  // Motif adinkra — cercles et losanges
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#060C18"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#4a90e2" stroke-width="2" opacity="0.5"/>
    <circle cx="50" cy="50" r="18" fill="none" stroke="#6ab344" stroke-width="1.5" opacity="0.5"/>
    <circle cx="50" cy="50" r="6" fill="#4a90e2" opacity="0.7"/>
    <circle cx="150" cy="50" r="30" fill="none" stroke="#6ab344" stroke-width="2" opacity="0.5"/>
    <circle cx="150" cy="50" r="18" fill="none" stroke="#4a90e2" stroke-width="1.5" opacity="0.5"/>
    <circle cx="150" cy="50" r="6" fill="#6ab344" opacity="0.7"/>
    <circle cx="50" cy="150" r="30" fill="none" stroke="#6ab344" stroke-width="2" opacity="0.5"/>
    <circle cx="50" cy="150" r="18" fill="none" stroke="#4a90e2" stroke-width="1.5" opacity="0.5"/>
    <circle cx="50" cy="150" r="6" fill="#6ab344" opacity="0.7"/>
    <circle cx="150" cy="150" r="30" fill="none" stroke="#4a90e2" stroke-width="2" opacity="0.5"/>
    <circle cx="150" cy="150" r="18" fill="none" stroke="#6ab344" stroke-width="1.5" opacity="0.5"/>
    <circle cx="150" cy="150" r="6" fill="#4a90e2" opacity="0.7"/>
    <polygon points="100,60 120,100 100,140 80,100" fill="none" stroke="#4a90e2" stroke-width="1.5" opacity="0.5"/>
    <polygon points="100,70 112,100 100,130 88,100" fill="#6ab344" opacity="0.15"/>
    <line x1="50" y1="50" x2="150" y2="50" stroke="#4a90e2" stroke-width="0.5" opacity="0.3" stroke-dasharray="4,4"/>
    <line x1="50" y1="150" x2="150" y2="150" stroke="#4a90e2" stroke-width="0.5" opacity="0.3" stroke-dasharray="4,4"/>
    <line x1="50" y1="50" x2="50" y2="150" stroke="#6ab344" stroke-width="0.5" opacity="0.3" stroke-dasharray="4,4"/>
    <line x1="150" y1="50" x2="150" y2="150" stroke="#6ab344" stroke-width="0.5" opacity="0.3" stroke-dasharray="4,4"/>
  </svg>`,

  // Motif bogolan — triangles et lignes
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#0d1f3c"/>
    <polygon points="0,0 100,0 50,87" fill="#4a90e2" opacity="0.2"/>
    <polygon points="100,0 200,0 150,87" fill="#6ab344" opacity="0.2"/>
    <polygon points="50,87 150,87 100,174" fill="#4a90e2" opacity="0.2"/>
    <polygon points="0,200 100,200 50,113" fill="#6ab344" opacity="0.2"/>
    <polygon points="100,200 200,200 150,113" fill="#4a90e2" opacity="0.2"/>
    <line x1="0" y1="0" x2="200" y2="200" stroke="#4a90e2" stroke-width="1" opacity="0.25"/>
    <line x1="200" y1="0" x2="0" y2="200" stroke="#6ab344" stroke-width="1" opacity="0.25"/>
    <line x1="100" y1="0" x2="100" y2="200" stroke="#4a90e2" stroke-width="0.5" opacity="0.2"/>
    <line x1="0" y1="100" x2="200" y2="100" stroke="#6ab344" stroke-width="0.5" opacity="0.2"/>
    <rect x="85" y="85" width="30" height="30" fill="none" stroke="#4a90e2" stroke-width="2" opacity="0.6" transform="rotate(45 100 100)"/>
    <rect x="90" y="90" width="20" height="20" fill="#6ab344" opacity="0.25" transform="rotate(45 100 100)"/>
    <circle cx="0" cy="0" r="15" fill="#4a90e2" opacity="0.3"/>
    <circle cx="200" cy="0" r="15" fill="#6ab344" opacity="0.3"/>
    <circle cx="0" cy="200" r="15" fill="#6ab344" opacity="0.3"/>
    <circle cx="200" cy="200" r="15" fill="#4a90e2" opacity="0.3"/>
  </svg>`,

  // Motif wax — fleurs et étoiles
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#060C18"/>
    <g transform="translate(100,100)">
      <polygon points="0,-40 10,-15 35,-25 20,0 35,25 10,15 0,40 -10,15 -35,25 -20,0 -35,-25 -10,-15" fill="#4a90e2" opacity="0.3"/>
      <polygon points="0,-25 7,-10 22,-16 13,0 22,16 7,10 0,25 -7,10 -22,16 -13,0 -22,-16 -7,-10" fill="#6ab344" opacity="0.4"/>
      <circle cx="0" cy="0" r="8" fill="#4a90e2" opacity="0.7"/>
    </g>
    <g transform="translate(30,30)">
      <circle cx="0" cy="0" r="20" fill="none" stroke="#4a90e2" stroke-width="1.5" opacity="0.4"/>
      <circle cx="0" cy="0" r="12" fill="none" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
      <circle cx="0" cy="0" r="4" fill="#6ab344" opacity="0.6"/>
    </g>
    <g transform="translate(170,30)">
      <circle cx="0" cy="0" r="20" fill="none" stroke="#6ab344" stroke-width="1.5" opacity="0.4"/>
      <circle cx="0" cy="0" r="12" fill="none" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
      <circle cx="0" cy="0" r="4" fill="#4a90e2" opacity="0.6"/>
    </g>
    <g transform="translate(30,170)">
      <circle cx="0" cy="0" r="20" fill="none" stroke="#6ab344" stroke-width="1.5" opacity="0.4"/>
      <circle cx="0" cy="0" r="12" fill="none" stroke="#4a90e2" stroke-width="1" opacity="0.4"/>
      <circle cx="0" cy="0" r="4" fill="#4a90e2" opacity="0.6"/>
    </g>
    <g transform="translate(170,170)">
      <circle cx="0" cy="0" r="20" fill="none" stroke="#4a90e2" stroke-width="1.5" opacity="0.4"/>
      <circle cx="0" cy="0" r="12" fill="none" stroke="#6ab344" stroke-width="1" opacity="0.4"/>
      <circle cx="0" cy="0" r="4" fill="#6ab344" opacity="0.6"/>
    </g>
    <line x1="0" y1="100" x2="200" y2="100" stroke="#4a90e2" stroke-width="0.5" opacity="0.2" stroke-dasharray="6,6"/>
    <line x1="100" y1="0" x2="100" y2="200" stroke="#6ab344" stroke-width="0.5" opacity="0.2" stroke-dasharray="6,6"/>
  </svg>`,
];

const patternLabels = ["Kente", "Adinkra", "Bogolan", "Wax"];

export default function BecomeSellerPage() {
  const { user } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [formDataValues, setFormDataValues] = useState({
    businessName: "",
    businessDomain: "",
    businessEmail: "",
    phoneNumber: "",
  });

  // ✅ Défilement automatique des motifs toutes les 3s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % africanPatterns.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login?callbackUrl=/become-seller");
    } else if (user.isSeller) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const totalFields = 4;
    const filledFields = Object.values(formDataValues).filter(val => val.trim() !== "").length;
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formDataValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in formDataValues) {
      setFormDataValues(prev => ({ ...prev, [name]: value }));
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const phone = values.phoneNumber as string;
    if (phone && phone.length < 9) {
      toast({ variant: "destructive", description: "Veuillez entrer un numero valide." });
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Erreur");
      toast({ description: "Felicitations ! Votre boutique DealCity Pro est prete." });
      router.push("/");
      router.refresh();
    } catch {
      toast({ variant: "destructive", description: "Une erreur est survenue. Veuillez reessayer." });
      setLoading(false);
    }
  }

  if (!user || user.isSeller) return null;

  return (
    <div className="fixed inset-0 z-50 flex w-screen h-dvh overflow-hidden bg-[#f8fbff] dark:bg-[#09090b]">

      {/* ✅ Colonne gauche — formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto relative z-10">

        {/* Bouton retour */}
        <div className="px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#4a90e2] dark:text-zinc-400 transition-all"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-[#4a90e2]/10 transition-colors">
              <ArrowLeft className="size-4" />
            </div>
            <span>{t.back}</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-14 py-8 max-w-lg mx-auto w-full">

          {/* Header */}
          <div className="mb-8 space-y-3">
            <div className="flex items-end gap-2.5">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#4a90e2] to-[#6ab344] bg-clip-text text-transparent">
                DealCity
              </span>
              <span className="text-xs font-black bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-wider">
                PRO
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
              {t.join_sellers}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {t.buy_sell_secure}
            </p>
            {/* Barre de progression */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4a90e2] to-[#6ab344] transition-all duration-500 rounded-full"
                style={{ width: `${formProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold">
              {formProgress}% complété
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Identité */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1">
                <Briefcase className="size-3" /> Identite de la boutique
              </p>

              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  name="businessName"
                  onChange={handleInputChange}
                  placeholder={t.display_name}
                  required
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2] focus-visible:border-[#4a90e2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    name="businessDomain"
                    onChange={handleInputChange}
                    placeholder="Domaine"
                    required
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    name="businessEmail"
                    type="email"
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-zinc-800" />

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                <Phone className="size-3" /> Contact & Reseaux
              </p>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                <Input
                  name="phoneNumber"
                  onChange={handleInputChange}
                  placeholder={t.whatsapp_number}
                  required
                  className="pl-10 rounded-xl border-emerald-300/50 bg-white dark:bg-zinc-800/60 focus-visible:ring-emerald-500 dark:border-zinc-700"
                />
              </div>

              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  name="whatsappUrl"
                  placeholder="Lien catalogue WhatsApp (Optionnel)"
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                />
              </div>

              {/* TikTok */}
              <div className="relative">
                <Music2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-600 dark:text-zinc-300" />
                <Input
                  name="tiktokUrl"
                  placeholder="TikTok (Optionnel)"
                  className="pl-10 rounded-xl bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700"
                />
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
                <Textarea
                  name="businessProducts"
                  placeholder={t.bio_placeholder}
                  className="pl-10 rounded-xl min-h-[80px] resize-none bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 focus-visible:ring-[#4a90e2]"
                />
              </div>
            </div>

            {/* Bouton submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2a629b] text-white font-black rounded-xl shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin size-5" /><span>{t.loading}</span></>
              ) : (
                <><span>{t.become_seller}</span><span>🚀</span></>
              )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="size-3 text-amber-500" />
              <span>{t.payment_secure}</span>
            </p>
          </form>
        </div>
      </div>

      {/* ✅ Colonne droite — motifs africains animés (desktop uniquement) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#060C18]">

        {/* Grille de points */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(74,144,226,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#4a90e2]/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#6ab344]/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#4a90e2]/4 blur-3xl" />

        <div className="relative w-full h-full flex flex-col items-center justify-center p-12 gap-8">

          {/* ✅ Motif SVG animé principal */}
          <div className="relative w-72 h-72">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPattern}
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-[#4a90e2]/20 border border-[#4a90e2]/20"
                dangerouslySetInnerHTML={{ __html: africanPatterns[currentPattern] }}
              />
            </AnimatePresence>

            {/* Ring décoratif autour */}
            <div className="absolute -inset-3 rounded-3xl border border-[#4a90e2]/10 pointer-events-none" />
            <div className="absolute -inset-6 rounded-3xl border border-[#6ab344]/5 pointer-events-none" />
          </div>

          {/* Label du motif */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`label-${currentPattern}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-1"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4a90e2]">
                Motif {patternLabels[currentPattern]}
              </p>
              <p className="text-xs text-white/30 font-medium">
                Héritage africain · Art & Commerce
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ✅ Indicateurs de position */}
          <div className="flex items-center gap-2">
            {africanPatterns.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPattern(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentPattern
                    ? "w-6 h-1.5 bg-[#4a90e2]"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* ✅ Grille de petits motifs en bas */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
            {africanPatterns.map((pattern, i) => (
              <motion.div
                key={i}
                onClick={() => setCurrentPattern(i)}
                className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  i === currentPattern
                    ? "border-[#4a90e2] scale-105 shadow-lg shadow-[#4a90e2]/20"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                dangerouslySetInnerHTML={{ __html: pattern }}
              />
            ))}
          </div>

          {/* Texte bas */}
          <div className="text-center space-y-1.5 max-w-xs">
            <p className="text-sm font-black text-white/70 tracking-tight">
              DealCity — Marketplace Cameroun
            </p>
            <p className="text-[10px] text-white/30 leading-relaxed">
              Rejoignez des milliers de vendeurs qui font confiance à DealCity pour développer leur business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}