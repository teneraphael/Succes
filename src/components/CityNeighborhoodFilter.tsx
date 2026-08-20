"use client";

import { MapPin, ChevronDown, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Liste étendue des quartiers pour couvrir l'informel
const CAMEROON_LOCATIONS: Record<string, string[]> = {
  
  "DOUALA": [
    "AKWA", "AKWA NORD", "AKWA SUD", "BONANJO", "BONAPRISO", "BALI",
    "DEÏDO", "NDOKOTTI", "NEW-BELL", "NEW-DEÏDO", "MAKEPE", "MAKEPE MISSOKE",
    "LOGBESSOU", "LOGPOM", "KOTTO", "BONABÉRI", "BONAMOUSSADI", "BONAMOUSSADI VILLAGE",
    "BASSA", "BASSA INDUSTRIEL", "NDOG-BONG", "NDOG-PASSI", "NKONGMONDO",
    "PK 8", "PK 10", "PK 11", "PK 12", "PK 13", "PK 14", "PK 17", "PK 19",
    "NYALLA", "NYALLA VILLAGE", "KAKE", "SODIKO", "CITÉ DES PALMIERS",
    "CITÉ SIC", "CITÉ OYACK", "VILLAGE", "NDOGHEM", "MBOPPI",
    "ANGE RAPHAEL", "CONGO", "BESSENGUE", "MBANYA", "NKOULOULOU",
    "OYACK", "MABANDA", "MBOKO", "NDIBE", "NDOGBEA", "NKOMBA",
    "BEPANDA", "BEPANDA OMNISPORT", "BEPANDA LIBRE", "NDOG-SIMPLE",
    "CITÉ CICAM", "CITÉ SONEL", "NDOGSIMBI", "NGODI BAKOKO",
    "NGODI SUR WOURI", "BILONGUE", "NDOKOTI", "MARCHÉ CONGO",
    "NJO-NJO", "ESSENGUE", "BONAPRISO EXTENSION", "BILINGUE",
    "MAKÉPÉ MATURITÉ", "CITÉ SIC BASSA", "CITÉ SIC MAKEPE", "SABLE", "YASSA", "ANCIEN DALIP", "BESSEKE", "GRAND HANGAR"
  ],
  "YAOUNDÉ": [
    "CENTRE-VILLE", "BASTOS", "NLONGKAK", "MVAN", "BIYEM-ASSI",
    "ESSOS", "MENDONG", "NGOUSSO", "NKOLBISSON", "ETOUDI",
    "MFANDENA", "OMNISPORT", "MESSA", "NKOMO", "NKOL-ETON",
    "KONDENGUI", "MADAGASCAR", "BRIQUETERIE", "MOKOLO", "MVOG-ADA",
    "MVOG-MBI", "MVOG-BETI", "MVOG-ATANGANA-MBALLA", "OBILI",
    "NGOA-EKELLE", "NKOLNDONGOD", "NKOL-AFEME", "ELIG-EFFA",
    "ELIG-ESSONO", "ELIG-EDZOA", "ELIG-MFOMO", "EKOUNOU",
    "EMANA", "AHALA", "SOA", "NKOLBISON", "TITI",
    "OYOM-ABANG", "OLEMBE", "NKOLDONGO", "ETAM-BAFIA",
    "ODZA", "MIMBOMAN", "CITÉ VERTE", "NTOUGOU", "NSAM",
    "NGOUSSO NORD", "NGOUSSO SUD", "MFOU", "SIMBOCK",
    "NKOLAFAMBA", "TSINGA", "QUARTIER DU LAC", "FÉBÉ", "MBALA", "NKOLMESSENG",
    "DAMAS", "FOUDA", "NKOMO VILLAGE", "NKOABANG", "NSIMEYONG", "OBOBOGO", "MESSASSI", "NKOMKANA"
  ],
  "BAFOUSSAM": [
    "CENTRE", "TAMDJA", "DJELENG", "KAMKOP", "NGOUACHE",
    "BANENGO", "FAMLA", "TOUGANG", "PLATEAU", "LELEM",
    "WENFOU", "KOPTCHOU", "DJELENG NORD", "DJELENG SUD",
    "NYLON", "NATTRAKOM", "KWA-KWA", "NKOU'OU", "BANGOUA",
    "FOMKAP", "BAMENDOU", "NKOUOPTAMO", "TYO-VILLE",
    "KAMKOP VILLAGE", "KOUOKOUE", "KOUPA", "NGOUMOU", "NIETCHE", "BATOUFAM", "KOUOGOUO", "HIALA"
  ],
  "BUEA": [
    "MOLYKO", "GREAT SOPPO", "BONDUMA", "MILE 16", "MILE 17",
    "BOMAKA", "BOKWANGO", "BUEA TOWN", "BUEA ROAD", "CLERKS QUARTER",
    "GRA", "SANDPIT", "TOLE", "WONYANGONG", "MUEA",
    "LIKOKO", "MEMBEA", "LYSOKA", "BOKOVA", "BOVA",
    "EWONDA", "MUYUKA", "KAKE", "SASSE", "WONIKANG", "BONGO SQUARE", "SMALL SOPPO", "CHECK POINT"
  ],
  "KRIBI": [
    "CENTRE", "TALLA", "MBAA", "GRAND BATANGA", "PETIT BATANGA",
    "MPALLA", "LOLABÉ", "LONDJI", "NZIOU", "BIBAMBA",
    "MPOLONGWE", "QUARTIER BELLE VUE", "QUARTIER COMMERCE",
    "CAMPING", "NOUVELLE ROUTE", "AKOM II", "MBOA MANGA", "MPANG", "NGOYE", "OCEAN", "MBADJI", "DOMBE", "BOUSOUMA", "MBEKA'A"
  ],
  "LIMBE": [
    "DOWN BEACH", "MILE 4", "CLERKS QUARTER", "BOTA",
    "NEW TOWN", "CASSAVA FARM", "GRA", "CHURCH STREET",
    "MABETA", "MOTOWO", "HALF MILE", "CONGO TOWN",
    "MBENDE", "SANJE", "IDENAU", "MOKUNDANGE", "MIDDLE FARM", "UNITY QUARTERS"
  ],
  "GAROUA": [
    "CENTRE", "LOPÉRÉ", "PLATEAU", "MAROUARÉ", "POUMPOUMRÉ",
    "SOUARÉ", "DJAMBOUTOU", "BAGALADJI", "BOCKLÉ",
    "ROUMDÉ ADJIA", "FOULBÉRÉ", "DOUGOY", "NGONG",
    "BIBÉMI", "MAYO HOURNA", "YELWA", "CALDOU", "DJARENGOL", "BASE", "OURO-LADDEO"
  ],
  "MAROUA": [
    "CENTRE", "DOUGOY", "PALAR", "KAKATARÉ", "LOUGGÉRÉ",
    "DOMAYO", "ZOKOK", "DOUGOÏ", "BONGUEL", "ROUDOURÉ",
    "HARDÉ", "FOUNANGUÉ", "MAKABAYE", "KODEK", "PAPATA",
    "PITOA", "BALAZA", "DOGBA", "PITOARE", "FOUMBAN ROAD", "HARDJO", "ABATTOIR", "DROGUE", "DOUALARÉ"
  ],
  "NGAOUNDÉRÉ": [
    "CENTRE", "DANG", "MBIDENG", "GADAMABANGA", "BALADJI",
    "JARENG", "BOULKITOU", "MADIRÉ", "NGAOUNDABA", "MARTAP",
    "TIBATI", "DIBI", "BÉKA", "SABONGARI", "RIBEIRAO"
  ],
  "BAMENDA": [
    "COMMERCIAL AVENUE", "UP STATION", "OLD TOWN", "NKWEN",
    "NTARIKON", "COWBELL", "HOSPITAL AREA", "FOOD MARKET",
    "MBATU", "MULANG", "BARRACK", "MILE 4 NKWEN",
    "MANKON", "AZIRE", "PINYIN", "BAMBUI", "BAMBILI",
    "BALI", "SANTA", "BAFUT", "MILE 3", "MILE 2", "NEW TOWN", "NITOP", "ABANGOH"
  ],
  "BERTOUA": [
    "CENTRE", "NKOLBIKON", "HAOUSSA", "MBOUKOU", "MOKOLO",
    "CITÉ DES SAPEURS", "CITÉ MEIGANGA", "MINROU",
    "DOUMÉ", "ABONG-MBANG", "LOMIÉ", "ENIA", "BONGANDÉ", "KPOKOLOTA"
  ],
  "EBOLOWA": [
    "CENTRE", "ANGALÉ", "NKOLTANG", "NKOL-NNAM", "MENGONG",
    "MVANGAN", "AMBAM", "MA'AN", "MEYO-CENTRE", "EFOULAN", "NKO'OVOS", "AKAK", "MEIMBANG", "EBOLOWA II"
  ],
  "EDÉA": [
    "CENTRE", "PORT", "CITÉ ALUCAM", "PONT-RAIL", "BORNE 5",
    "NDOG-BONG", "MALIMBA", "MOUANKO", "DIZANGUÉ"
  ],
  "KUMBA": [
    "MILE 1", "MILE 2", "MILE 3", "MILE 4", "MILE 6",
    "BUEA ROAD", "FIANGO", "MBENG", "KAKE",
    "TIKO ROAD", "KOMB", "MUNDEMBA"
  ],
  "NKONGSAMBA": [
    "CENTRE", "BAMENDJOU", "MELONG", "MANJO", "LOUM",
    "MBANGA", "NJORÉ", "BAKAKA", "TOMBEL"
  ],
  "SANGMÉLIMA": [
    "CENTRE", "BIBA", "DJOUM", "OVENG", "BENGBIS",
    "MEYOMESSALA", "ZOÉTÉLÉ"
  ],
  "FOUMBAN": [
    "CENTRE", "NJIMOM", "KOUTABA", "MAGBA", "MALANTOUEN",
    "BANGOURAIN", "MVOUTTE", "NJINKA", "MPEPOUO", "AÉROPORT", "PALAIS"
  ],
  "DSCHANG": [
    "CENTRE", "FOTO", "FONGO-TONGO", "SANTCHOU", "KÉKEM",
    "BAFOU", "PENKA-MICHEL"
  ],
  "MBOUDA": [
    "CENTRE", "BATCHAM", "BABADJOU", "BAFANG", "BANDJA",
    "GALIM", "BATIÉ"
  ],
  "TIBATI": [
    "CENTRE", "NGAOUNDAL", "MBAKAOU", "WOULDÉ"
  ],
  "BATOURI": [
    "CENTRE", "KENTZOU", "NDÉLÉLÉ", "YOKADOUMA",
    "MOLOUNDOU", "NOLA"
  ]
};

export function CityNeighborhoodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get("city") || "";
  const currentNeighborhood = searchParams.get("neighborhood") || "";

  const availableNeighborhoods = (currentCity && CAMEROON_LOCATIONS[currentCity]) 
    ? [...CAMEROON_LOCATIONS[currentCity]].sort() 
    : [];

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Utilisation de replace avec scroll: false pour éviter le saut de page et le rechargement brutal
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 w-full py-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-zinc-400 shrink-0 px-1">
        <MapPin className="size-4 text-[#3a81f3]" />
        <span className="hidden sm:inline">Lieu :</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
        {/* Sélecteur Ville */}
        <div className="relative shrink-0">
          <select
            value={currentCity}
            onChange={(e) => {
              const val = e.target.value;
              updateParams({ city: val || null, neighborhood: null });
            }}
            className="appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#3a81f3] cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {Object.keys(CAMEROON_LOCATIONS).sort().map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Sélecteur Quartier */}
        {currentCity && availableNeighborhoods.length > 0 && (
          <div className="relative shrink-0 animate-in fade-in duration-200">
            <select
              value={currentNeighborhood}
              onChange={(e) => {
                const val = e.target.value;
                updateParams({ neighborhood: val || null });
              }}
              className="appearance-none bg-blue-50/50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#3a81f3] cursor-pointer"
            >
              <option value="">Tous les quartiers</option>
              {availableNeighborhoods.map((neigh) => (
                <option key={neigh} value={neigh}>{neigh}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Bouton de réinitialisation rapide si un filtre est actif */}
        {(currentCity || currentNeighborhood) && (
          <button
            onClick={() => updateParams({ city: null, neighborhood: null })}
            className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2.5 py-2 rounded-xl hover:bg-red-100 transition-colors"
            title="Effacer les filtres"
          >
            <X className="size-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>
    </div>
  );
}