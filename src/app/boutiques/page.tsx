"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Store,
  Search,
  MapPin,
  Users,
  Briefcase,
  Sparkles,
  BadgeCheck,
  Package,
  ArrowUpRight,
  X,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Attachment {
  url: string;
  type?: string;
}

interface Post {
  id: string;
  content: string | null;
  thumbnailUrl: string | null;
  attachments: Attachment[];
}

interface Shop {
  id: string;
  username: string;
  displayName: string | null;
  businessName: string | null;
  businessDomain: string | null;
  city: string | null;
  neighborhood: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  _count: {
    followers: number;
  };
  posts: Post[];
}

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") ||
  url.includes("utfs.io") ||
  url.includes("lh3.googleusercontent.com");

export default function BoutiquesPage() {
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await fetch("/api/shops");

        if (!res.ok) {
          throw new Error("Impossible de charger les boutiques");
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setShops(data);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des boutiques:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    if (!term) return shops;

    return shops.filter((shop) => {
      const searchableText = [
        shop.businessName,
        shop.displayName,
        shop.businessDomain,
        shop.city,
        shop.neighborhood,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [shops, searchQuery]);

  const totalFollowers = useMemo(() => {
    return shops.reduce(
      (total, shop) => total + (shop._count?.followers || 0),
      0
    );
  }, [shops]);

  const totalProducts = useMemo(() => {
    return shops.reduce(
      (total, shop) => total + (shop.posts?.length || 0),
      0
    );
  }, [shops]);

  return (
    <main className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-8">

        {/* HEADER RETOUR */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border border-border bg-card flex items-center justify-center hover:bg-muted active:scale-95 transition-all shadow-sm"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-black">
              Boutiques
            </h1>

            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Découvrez les vendeurs DealCity
            </p>
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-background to-blue-500/10">
          <div className="absolute -top-24 -right-24 w-56 sm:w-72 h-56 sm:h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-32 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-5 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">

              {/* TEXTE */}
              <div className="max-w-2xl space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Découvrez les vendeurs sur DealCity</span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    Explorez les meilleures
                    <span className="text-primary"> boutiques.</span>
                  </h2>

                  <p className="text-xs sm:text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Trouvez facilement des vendeurs, découvrez leurs produits
                    et explorez les boutiques disponibles près de chez vous.
                  </p>
                </div>

                {/* STATS */}
                <div className="flex gap-2 sm:gap-3 pt-2 overflow-x-auto pb-1">
                  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>

                    <div>
                      <p className="text-base sm:text-lg font-black leading-none">
                        {shops.length}
                      </p>

                      <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-1">
                        Boutiques
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>

                    <div>
                      <p className="text-base sm:text-lg font-black leading-none">
                        {totalProducts}
                      </p>

                      <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-1">
                        Produits
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    </div>

                    <div>
                      <p className="text-base sm:text-lg font-black leading-none">
                        {totalFollowers}
                      </p>

                      <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-1">
                        Abonnés
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ICONE PC */}
              <div className="hidden lg:flex w-44 h-44 xl:w-52 xl:h-52 rounded-[2.5rem] bg-primary/10 border border-primary/10 items-center justify-center rotate-6 shadow-2xl">
                <Store className="w-20 h-20 xl:w-24 xl:h-24 text-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* RECHERCHE */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black">
              Toutes les boutiques
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {filteredShops.length} boutique
              {filteredShops.length !== 1 ? "s" : ""} trouvée
              {filteredShops.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative w-full sm:w-[420px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />

            <input
              type="text"
              placeholder="Nom, activité, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-11 sm:pr-12 rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm outline-none text-xs sm:text-sm transition-all duration-300 focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-primary/40"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* LOADING */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-border bg-card p-3 sm:p-4 animate-pulse"
              >
                <div className="h-20 sm:h-28 bg-muted rounded-xl mb-3" />

                <div className="flex gap-2">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-muted" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-muted rounded-lg w-3/4" />
                    <div className="h-2 sm:h-3 bg-muted rounded-lg w-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-4">
                  <div className="aspect-square bg-muted rounded-lg sm:rounded-xl" />
                  <div className="aspect-square bg-muted rounded-lg sm:rounded-xl" />
                </div>

                <div className="h-9 sm:h-10 bg-muted rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          /* EMPTY STATE */
          <div className="border border-border rounded-[1.5rem] sm:rounded-[2rem] bg-card py-16 sm:py-20 px-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-muted flex items-center justify-center mb-5">
              <Store className="w-8 h-8 sm:w-9 sm:h-9 text-muted-foreground" />
            </div>

            <h3 className="text-lg sm:text-xl font-black">
              Aucune boutique trouvée
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Essayez un autre nom, une autre activité ou recherchez une
              boutique dans une autre ville.
            </p>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Voir toutes les boutiques
              </button>
            )}
          </div>
        ) : (
          /* BOUTIQUES */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {filteredShops.map((shop) => {
              const shopName =
                shop.businessName ||
                shop.displayName ||
                "Boutique DealCity";

              return (
                <article
                  key={shop.id}
                  className="group relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] bg-card border border-border/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* COVER */}
                  <div className="relative h-20 sm:h-28 bg-gradient-to-br from-primary/25 via-primary/10 to-blue-500/20 overflow-hidden">
                    {shop.coverUrl && (
                      <Image
                        src={shop.coverUrl}
                        alt={shopName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        unoptimized={isExternalImage(shop.coverUrl)}
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* BADGE */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-xl border border-white/20 px-2 py-1 sm:px-2.5 text-[8px] sm:text-[10px] font-bold">
                      <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="hidden sm:inline">Boutique</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 pt-0">

                    {/* AVATAR + FOLLOWERS */}
                    <div className="relative -mt-6 sm:-mt-7 mb-2 sm:mb-3 flex items-end justify-between">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-background border-3 sm:border-4 border-card shadow-md">
                        {shop.avatarUrl ? (
                          <Image
                            src={shop.avatarUrl}
                            alt={shopName}
                            fill
                            className="object-cover"
                            unoptimized={isExternalImage(shop.avatarUrl)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-black text-base sm:text-xl">
                            {shopName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 rounded-lg sm:rounded-xl bg-muted/70 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[9px] sm:text-[11px] font-bold text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        {shop._count?.followers || 0}
                      </div>
                    </div>

                    {/* INFORMATIONS */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div>
                        <h2 className="font-black text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                          {shopName}
                        </h2>

                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                          @{shop.username}
                        </p>
                      </div>

                      {shop.businessDomain && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0" />

                          <span className="truncate">
                            {shop.businessDomain}
                          </span>
                        </div>
                      )}

                      {(shop.city || shop.neighborhood) && (
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />

                          <span className="truncate">
                            {[shop.neighborhood, shop.city]
                              .filter(
                                (item): item is string => Boolean(item)
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PRODUITS */}
                    {shop.posts?.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            Produits
                          </p>

                          <span className="text-[8px] sm:text-[10px] font-bold text-primary">
                            {shop.posts.length} article
                            {shop.posts.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {shop.posts.slice(0, 2).map((post) => {
                            const firstImage =
                              post.attachments?.find(
                                (media) => media.type === "IMAGE"
                              )?.url;

                            const firstVideo =
                              post.attachments?.find(
                                (media) => media.type === "VIDEO"
                              )?.url;

                            const mediaUrl =
                              post.thumbnailUrl ||
                              firstImage ||
                              "";

                            const isVideo =
                              !mediaUrl && Boolean(firstVideo);

                            return (
                              <Link
                                key={post.id}
                                href={`/users/${shop.username}`}
                                className="relative aspect-[4/5] sm:aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-muted border border-border/50"
                              >
                                {mediaUrl ? (
                                  <Image
                                    src={mediaUrl}
                                    alt="Produit"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    unoptimized={isExternalImage(mediaUrl)}
                                  />
                                ) : isVideo ? (
                                  <video
                                    src={firstVideo}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    preload="metadata"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 text-center text-[9px] sm:text-[10px] text-muted-foreground">
                                    {post.content || "Produit DealCity"}
                                  </div>
                                )}

                                {isVideo && (
                                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black/60 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                    ▶
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BOUTON */}
                    <Link
                      href={`/users/${shop.username}`}
                      className="mt-3 sm:mt-5 w-full h-9 sm:h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-black hover:opacity-90 active:scale-[0.97] transition-all"
                    >
                      <span className="hidden min-[380px]:inline">
                        Visiter
                      </span>

                      <span className="min-[380px]:hidden">
                        Voir
                      </span>

                      <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}