"use client";

import { useEffect, useMemo, useState } from "react";
import {
Store,
Search,
MapPin,
Users,
Briefcase,
ChevronRight,
Sparkles,
BadgeCheck,
Package,
ArrowUpRight,
X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

    {/* HERO */}
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-background to-blue-500/10">

      {/* Décor */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          {/* Texte */}
          <div className="max-w-2xl space-y-5">

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Découvrez les vendeurs sur DealCity</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Explorez les meilleures
                <span className="text-primary"> boutiques.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Trouvez facilement des vendeurs, découvrez leurs produits
                et explorez les boutiques disponibles près de chez vous.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 pt-2">

              <div className="flex items-center gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>

                <div>
                  <p className="text-lg font-black leading-none">
                    {shops.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Boutiques
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>

                <div>
                  <p className="text-lg font-black leading-none">
                    {totalProducts}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Produits affichés
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>

                <div>
                  <p className="text-lg font-black leading-none">
                    {totalFollowers}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Abonnés
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Icône décorative */}
          <div className="hidden lg:flex w-44 h-44 xl:w-52 xl:h-52 rounded-[2.5rem] bg-primary/10 border border-primary/10 items-center justify-center rotate-6 shadow-2xl">
            <Store className="w-20 h-20 xl:w-24 xl:h-24 text-primary" />
          </div>

        </div>
      </div>
    </section>

    {/* RECHERCHE */}
    <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div>
        <h2 className="text-xl sm:text-2xl font-black">
          Toutes les boutiques
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          {filteredShops.length} boutique
          {filteredShops.length !== 1 ? "s" : ""} trouvée
          {filteredShops.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative w-full sm:w-[420px] group">

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />

        <input
          type="text"
          placeholder="Nom, activité, ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-12 rounded-2xl bg-card border border-border shadow-sm outline-none text-sm transition-all duration-300 focus:ring-4 focus:ring-primary/10 focus:border-primary hover:border-primary/40"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-border bg-card p-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded-lg w-3/4" />
                <div className="h-3 bg-muted rounded-lg w-1/2" />
                <div className="h-3 bg-muted rounded-lg w-2/3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <div className="h-24 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
            </div>

            <div className="h-10 bg-muted rounded-xl mt-5" />
          </div>
        ))}

      </div>
    ) : filteredShops.length === 0 ? (

      /* EMPTY STATE */
      <div className="border border-border rounded-[2rem] bg-card py-20 px-6 text-center">

        <div className="w-20 h-20 mx-auto rounded-3xl bg-muted flex items-center justify-center mb-5">
          <Store className="w-9 h-9 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-black">
          Aucune boutique trouvée
        </h3>

        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
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
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

        {filteredShops.map((shop) => {

          const shopName =
            shop.businessName ||
            shop.displayName ||
            "Boutique DealCity";

          return (
            <article
              key={shop.id}
              className="group relative overflow-hidden rounded-[1.5rem] bg-card border border-border/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >

              {/* Cover */}
              <div className="relative h-24 sm:h-28 bg-gradient-to-br from-primary/25 via-primary/10 to-blue-500/20 overflow-hidden">

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

                {/* Badge */}
                <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-xl border border-white/20 px-2.5 py-1 text-[10px] font-bold">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  Boutique
                </div>

              </div>

              <div className="p-4 pt-0">

                {/* Avatar */}
                <div className="relative -mt-7 mb-3 flex items-end justify-between">

                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-background border-4 border-card shadow-md">

                    {shop.avatarUrl ? (
                      <Image
                        src={shop.avatarUrl}
                        alt={shopName}
                        fill
                        className="object-cover"
                        unoptimized={isExternalImage(shop.avatarUrl)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-black text-xl">
                        {shopName.charAt(0).toUpperCase()}
                      </div>
                    )}

                  </div>

                  <div className="flex items-center gap-1.5 rounded-xl bg-muted/70 px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {shop._count?.followers || 0}
                  </div>

                </div>

                {/* Informations */}
                <div className="space-y-2">

                  <div>
                    <h2 className="font-black text-base truncate group-hover:text-primary transition-colors">
                      {shopName}
                    </h2>

                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      @{shop.username}
                    </p>
                  </div>

                  {shop.businessDomain && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5 text-primary flex-shrink-0" />

                      <span className="truncate">
                        {shop.businessDomain}
                      </span>
                    </div>
                  )}

                  {(shop.city || shop.neighborhood) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />

                      <span className="truncate">
                        {[shop.neighborhood, shop.city]
                          .filter(
                            (item): item is string =>
                              Boolean(item)
                          )
                          .join(", ")}
                      </span>
                    </div>
                  )}

                </div>

                {/* PRODUITS */}
                {shop.posts?.length > 0 && (
                  <div className="mt-4">

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Produits
                      </p>

                      <span className="text-[10px] font-bold text-primary">
                        {shop.posts.length} article
                        {shop.posts.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">

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
                            className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50"
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
                              <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] text-muted-foreground">
                                {post.content || "Produit DealCity"}
                              </div>
                            )}

                            {isVideo && (
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-full">
                                ▶ VIDÉO
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
                  className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-black hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Visiter la boutique

                  <ArrowUpRight className="w-4 h-4" />
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