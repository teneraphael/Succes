"use client";

import { useEffect, useState } from "react";
import { Store, Search, MapPin, Users, Briefcase, ChevronRight, Sparkles } from "lucide-react";
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

export default function BoutiquesPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Récupération des boutiques depuis l'API
  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await fetch("/api/shops");
        const data = await res.json();
        if (Array.isArray(data)) {
          setShops(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des boutiques:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  // Filtrer les boutiques selon la recherche
  const filteredShops = shops.filter((shop) => {
    const term = searchQuery.toLowerCase();
    const name = (shop.businessName || shop.displayName || "").toLowerCase();
    const domain = (shop.businessDomain || "").toLowerCase();
    const city = (shop.city || "").toLowerCase();
    const neighborhood = (shop.neighborhood || "").toLowerCase();

    return name.includes(term) || domain.includes(term) || city.includes(term) || neighborhood.includes(term);
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* En-tête de la page ultra stylé */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent p-6 sm:p-8 border border-border/60 shadow-sm backdrop-blur-md">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Store className="w-52 h-52 text-primary" />
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Annuaire Officiel DealCity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Découvrez les Boutiques</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            Explorez les meilleures boutiques vérifiées, parcourez leurs produits phares et connectez-vous directement avec les vendeurs.
          </p>
        </div>
      </div>

      {/* Barre de recherche moderne */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par nom, secteur d'activité, ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-card border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all shadow-sm hover:border-primary/40"
        />
      </div>

      {/* Grille des boutiques (2 sur mobile, 3 sur tablette, 4 sur PC) */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border p-8 shadow-sm space-y-3">
          <Store className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="font-bold text-lg">Aucune boutique trouvée</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Aucun résultat ne correspond à votre recherche. Essayez d&apos;autres mots-clés.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4 gap-3.5 group"
            >
              {/* Infos principales : Avatar circulaire + Nom */}
              <div className="flex items-start gap-3">
                {/* Avatar / Logo CIRCULAIRE */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-border/60 shadow-sm">
                  {shop.avatarUrl ? (
                    <Image
                      src={shop.avatarUrl}
                      alt={shop.businessName || "Boutique"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-base">
                      {(shop.businessName || shop.displayName || "B")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Nom et Domaine */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm sm:text-base tracking-tight group-hover:text-primary transition-colors truncate">
                    {shop.businessName || shop.displayName || "Boutique sans nom"}
                  </h2>
                  {shop.businessDomain && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Briefcase className="w-3 h-3 flex-shrink-0 text-primary" />
                      <span className="truncate">{shop.businessDomain}</span>
                    </div>
                  )}
                  {(shop.city || shop.neighborhood) && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-rose-500" />
                      <span className="truncate">
                        {[shop.neighborhood, shop.city].filter((n): n is string => Boolean(n)).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION : Les 2 articles phares stylés */}
              {shop.posts && shop.posts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Articles phares :
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {shop.posts.map((post) => {
                      const mediaUrl = post.thumbnailUrl || (post.attachments && post.attachments.length > 0 ? post.attachments[0].url : null);

                      return (
                        <Link
                          key={post.id}
                          href={`/users/${shop.username}`}
                          className="relative h-20 sm:h-24 bg-muted rounded-xl overflow-hidden border border-border/60 group/post block shadow-inner"
                        >
                          {mediaUrl ? (
                            <Image
                              src={mediaUrl}
                              alt="Article phare"
                              fill
                              className="object-cover group-hover/post:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full p-1.5 flex items-center justify-center bg-muted/80 text-[10px] text-center text-muted-foreground line-clamp-2">
                              {post.content || "Publication"}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/post:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bas de carte : Abonnés + Bouton Visiter moderne */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <div className="flex items-center gap-1 font-semibold text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{shop._count.followers}</span>
                </div>
                <Link
                  href={`/users/${shop.username}`}
                  className="inline-flex items-center gap-1 font-bold text-xs bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3 py-1.5 rounded-xl transition-all duration-300 shadow-sm"
                >
                  <span>Visiter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}