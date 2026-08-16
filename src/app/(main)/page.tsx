import { validateRequest } from "@/auth";
import TrendsSidebar from "@/components/TrendsSidebar";
import FeedTabs from "@/components/FeedTabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import { CityNeighborhoodFilter } from "@/components/CityNeighborhoodFilter";
import Link from "next/link";
import { Lock, ShoppingBag, TrendingUp, Zap } from "lucide-react";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ city?: string; neighborhood?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { user } = await validateRequest();
  const resolvedSearchParams = await searchParams;
  const selectedCity = resolvedSearchParams.city;
  const selectedNeighborhood = resolvedSearchParams.neighborhood;
  const feedKey = `${selectedCity}-${selectedNeighborhood}`;

  return (
    <main className="flex w-full min-w-0 gap-5 min-h-screen">
      <div className="w-full min-w-0 space-y-4">

        {/* ✅ Hero banner — visiteur non connecté */}
        {!user && (
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl bg-white border border-gray-100 px-6 py-8 shadow-sm">

            {/* Grille de points décorative subtile */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#3a81f3 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            
            {/* Cercles lumineux discrets en version claire */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#3a81f3]/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#1aa04b]/5 blur-3xl pointer-events-none" />

            <div className="relative space-y-5">
              {/* Logo DealCity */}
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-[4px] h-8 pb-1">
                  <div className="w-[5px] h-4 bg-[#3a81f3] rounded-full" />
                  <div className="w-[5px] h-6 bg-[#3a81f3] rounded-full" />
                  <div className="w-[5px] h-8 bg-[#3a81f3] rounded-full" />
                  <div className="w-[5px] h-5 bg-[#3a81f3] rounded-full" />
                </div>
                
                <span className="text-xl font-bold text-[#1aa04b] tracking-tight">DealCity</span>
                
                <span className="text-[9px] font-bold bg-blue-50 text-[#3a81f3] border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cameroun
                </span>
              </div>

              {/* Message d'accroche */}
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  La marketplace qui<br />
                  <span className="text-[#3a81f3]">connecte</span> vendeurs<br />
                  et acheteurs
                </h1>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">
                  Découvrez des milliers de produits · Discutez via WhatsApp · 100% Camerounais
                </p>
              </div>

              {/* 3 stats rapides */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { icon: ShoppingBag, label: "Produits", bg: "bg-blue-50 text-[#3a81f3] border-blue-100" },
                  { icon: TrendingUp, label: "Vendeurs", bg: "bg-emerald-50 text-[#1aa04b] border-emerald-100" },
                  { icon: Zap, label: "Via WhatsApp", bg: "bg-gray-50 text-gray-600 border-gray-100" },
                ].map(({ icon: Icon, label, bg }) => (
                  <div key={label} className={`flex items-center gap-1.5 border rounded-full px-3 py-1 ${bg}`}>
                    <Icon className="size-3.5" />
                    <span className="text-[10px] font-bold tracking-wide">{label}</span>
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[#3a81f3] hover:bg-[#2a6fd1] text-white px-6 py-2.5 rounded-full font-bold uppercase text-[11px] tracking-wider shadow-sm transition-all text-center justify-center flex-1 sm:flex-none"
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-[#1aa04b] hover:bg-[#15803c] text-white px-6 py-2.5 rounded-full font-bold uppercase text-[11px] tracking-wider shadow-sm transition-all text-center justify-center flex-1 sm:flex-none"
                >
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Bannière vendeur actif */}
        {user?.isSeller && (
          <div className="relative w-full overflow-hidden rounded-none sm:rounded-3xl px-5 py-4 border border-[#4a90e2]/20"
            style={{
              background: "linear-gradient(135deg, #f0f7ff 0%, #f0fff4 100%)",
            }}
          >
            <div className="absolute inset-0 rounded-none sm:rounded-3xl dark:bg-gradient-to-r dark:from-[#0a1628] dark:via-[#0d1f3a] dark:to-[#0a1628] opacity-0 dark:opacity-100 pointer-events-none" />

            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#4a90e2]/8 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#6ab344]/8 blur-2xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6ab344]">
                    Boutique active
                  </p>
                </div>
                <p className="text-sm font-black text-[#0a1628] dark:text-white">
                  Bonjour, {user.displayName} 👋
                </p>
                <p className="text-[10px] text-[#4a90e2] font-bold">
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

        {/* ✅ Filtre Ville & Quartier sécurisé par Suspense */}
        <div className="w-full bg-background/95 backdrop-blur-md border-b border-border/40 px-2 py-2 shadow-xs">
          <div className="max-w-full overflow-x-auto no-scrollbar flex items-center">
            <Suspense fallback={<div className="h-9 w-full animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-xl" />}>
              <CityNeighborhoodFilter />
            </Suspense>
          </div>
        </div>

        <FeedTabs
          key={feedKey}
          userId={user?.id}
          forYouFeed={<ForYouFeed userId={user?.id} city={selectedCity} neighborhood={selectedNeighborhood} />}
          followingFeed={
            user ? (
              <FollowingFeed />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-3xl border border-[#4a90e2]/15 text-center space-y-5 shadow-sm max-w-xl mx-auto">
                <div className="relative">
                  <div className="size-16 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
                    <Lock className="size-7 text-[#4a90e2]" />
                  </div>
                  <div className="absolute -top-1 -right-1 size-4 rounded-full bg-[#6ab344] border-2 border-card" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-foreground">
                    Section privée
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
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
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
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