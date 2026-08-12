import { validateRequest } from "@/auth";
import TrendsSidebar from "@/components/TrendsSidebar";
import FeedTabs from "@/components/FeedTabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import WelcomeMessage from "./WelcomeMessage";
import Link from "next/link";
import { Lock, ShoppingBag, TrendingUp, Zap } from "lucide-react";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <main className="flex w-full min-w-0 gap-5 min-h-screen">
      <div className="w-full min-w-0 space-y-4">

        {/* ✅ Banner visiteur non connecté — dark */}
        {!user && (
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl px-5 py-7 bg-[#060C18] border border-[#4a90e2]/15">
            {/* Grille de points */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(74,144,226,0.5) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Cercles lumineux */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#4a90e2]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#6ab344]/10 blur-3xl pointer-events-none" />

            <div className="relative space-y-4">
              {/* Logo + titre */}
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-[4px]">
                  <div className="w-[6px] h-3 bg-[#4a90e2] rounded-sm" />
                  <div className="w-[6px] h-5 bg-[#4a90e2] rounded-sm" />
                  <div className="w-[6px] h-7 bg-[#4a90e2] rounded-sm" />
                  <div className="w-[6px] h-4 bg-[#4a90e2] rounded-sm" />
                </div>
                <span className="text-xl font-black text-[#6ab344] tracking-tight">DealCity</span>
                <span className="text-[9px] font-black bg-[#4a90e2]/20 text-[#4a90e2] border border-[#4a90e2]/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Cameroun
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                  La marketplace qui<br />
                  <span className="text-[#4a90e2]">connecte</span> vendeurs<br />
                  et acheteurs
                </h1>
                <p className="text-xs text-white/50 font-medium leading-relaxed max-w-xs">
                  Découvrez des milliers de produits · Commandez via WhatsApp · 100% Camerounais
                </p>
              </div>

              {/* 3 stats rapides */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { icon: ShoppingBag, label: "Produits", color: "text-[#4a90e2]" },
                  { icon: TrendingUp, label: "Vendeurs", color: "text-[#6ab344]" },
                  { icon: Zap, label: "Via WhatsApp", color: "text-amber-400" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                    <Icon className={`size-3 ${color}`} />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#4a90e2] hover:bg-[#357abd] text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#4a90e2]/25 active:scale-95 transition-all"
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Banner connecté non-vendeur — dark */}
        {user && !user.isSeller && (
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl px-5 py-5 bg-[#060C18] border border-[#4a90e2]/15">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(74,144,226,0.4) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#4a90e2]/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-[#6ab344]/8 blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-[3px]">
                    <div className="w-[4px] h-2.5 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
                    <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
                  </div>
                  <span className="text-sm font-black text-white tracking-tight">
                    Bienvenue, <span className="text-[#4a90e2]">{user.displayName}</span> 👋
                  </span>
                </div>
                <p className="text-xs text-white/40 font-medium leading-relaxed max-w-xs">
                  Devenez vendeur et publiez vos produits sur DealCity pour toucher des milliers de clients.
                </p>
              </div>
              <Link
                href="/become-seller"
                className="shrink-0 flex items-center gap-1.5 bg-[#6ab344] hover:bg-[#5a9a38] text-white px-4 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-lg shadow-[#6ab344]/20 whitespace-nowrap"
              >
                <ShoppingBag className="size-3" />
                Vendre
              </Link>
            </div>
          </div>
        )}

        {/* ✅ Banner vendeur actif — dark */}
        {user?.isSeller && (
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl px-5 py-4 bg-[#060C18] border border-[#6ab344]/15">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(106,179,68,0.4) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#4a90e2]/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-[#6ab344]/8 blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6ab344]">
                    Boutique active
                  </p>
                </div>
                <p className="text-sm font-black text-white">
                  Bonjour, {user.displayName} 👋
                </p>
                <p className="text-[10px] text-white/40 font-medium">
                  Gérez vos produits et suivez vos stats
                </p>
              </div>
              <Link
                href="/seller/dashboard"
                className="shrink-0 flex items-center gap-1.5 bg-[#4a90e2] hover:bg-[#357abd] text-white px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-lg shadow-[#4a90e2]/20"
              >
                <Zap className="size-3" />
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* ✅ WelcomeMessage supprimé — remplacé par les banners ci-dessus */}

        <FeedTabs
          userId={user?.id}
          forYouFeed={<ForYouFeed userId={user?.id} />}
          followingFeed={
            user ? (
              <FollowingFeed />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#060C18] rounded-3xl border border-[#4a90e2]/15 text-center space-y-5 shadow-sm max-w-xl mx-auto">
                <div className="relative">
                  <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
                    <Lock className="size-7 text-[#4a90e2]" />
                  </div>
                  <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-[#060C18]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                    Section privée
                  </h3>
                  <p className="text-white/40 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                    Connectez-vous pour voir les publications des vendeurs que vous suivez.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-lg shadow-[#4a90e2]/25 hover:scale-105 active:scale-95 transition-all"
                >
                  Se connecter maintenant
                </Link>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#4a90e2]/5 border border-[#4a90e2]/10 rounded-full">
                  <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                    DealCity
                  </span>
                </div>
              </div>
            )
          }
        />
      </div>

      <div className="sticky top-[5.25rem] h-fit hidden xl:block w-80">
        <TrendsSidebar />
      </div>
    </main>
  );
}