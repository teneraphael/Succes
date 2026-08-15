"use client";

import { MapPin, ChevronDown, X, Building2, Map } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Liste étendue des quartiers pour couvrir l'informel
const CAMEROON_LOCATIONS: Record<string, string[]> = {
  "Douala": [
    "Akwa", "Akwa Nord", "Akwa Sud", "Bonanjo", "Bonapriso", "Bali",
    "Deïdo", "Ndokotti", "New-Bell", "New-Deïdo", "Makepe", "Makepe Missoke",
    "Logbessou", "Logpom", "Kotto", "Bonabéri", "Bonamoussadi", "Bonamoussadi Village",
    "Bassa", "Bassa Industriel", "Ndog-Bong", "Ndog-Passi", "Nkongmondo",
    "PK 8", "PK 10", "PK 11", "PK 12", "PK 13", "PK 14", "PK 17", "PK 19",
    "Nyalla", "Nyalla Village", "Kake", "Sodiko", "Cité des Palmiers",
    "Cité SIC", "Cité Oyack", "Village", "Ndoghem", "Mboppi",
    "Ange Raphael", "Congo", "Bessengue", "Mbanya", "Nkouloulou",
    "Oyack", "Mabanda", "Mboko", "Ndibe", "Ndogbea", "Nkomba",
    "Bepanda", "Bepanda Omnisport", "Bepanda libre", "Ndog-Simple",
    "Cité CICAM", "Cité SONEL", "Ndogsimbi", "Ngodi Bakoko",
    "Ngodi sur Wouri", "Bilongue", "Ndokoti", "Marché Congo",
    "Njo-Njo", "Essengue", "Bonapriso extension", "Bilingue",
    "Maképé Maturité", "Cité SIC Bassa", "Cité Sic Makepe", "Sable", "Yassa", "Ancien Dalip", "Besseke", "Grand Hangar"
  ],
  "Yaoundé": [
    "Centre-ville", "Bastos", "Nlongkak", "Mvan", "Biyem-Assi",
    "Essos", "Mendong", "Ngousso", "Nkolbisson", "Etoudi",
    "Mfandena", "Omnisport", "Messa", "Nkomo", "Nkol-Eton",
    "Kondengui", "Madagascar", "Briqueterie", "Mokolo", "Mvog-Ada",
    "Mvog-Mbi", "Mvog-Beti", "Mvog-Atangana-Mballa", "Obili",
    "Ngoa-Ekelle", "Nkolndongo", "Nkol-Afeme", "Elig-Effa",
    "Elig-Essono", "Elig-Edzoa", "Elig-Mfomo", "Ekounou",
    "Emana", "Ahala", "Soa", "Nkolbison", "Titi",
    "Oyom-Abang", "Olembe", "Nkoldongo", "Etam-Bafia",
    "Odza", "Mimboman", "Cité Verte", "Ntougou", "Nsam",
    "Ngousso Nord", "Ngousso Sud", "Mfou", "Simbock",
    "Nkolafamba", "Tsinga", "Quartier du Lac", "Fébé", "Mbala", "Nkolmesseng",
    "Damas", "Fouda", "Nkomo Village", "Nkoabang", "Nsimeyong", "Obobogo", "Messassi", "Nkomkana"
  ],
  "Bafoussam": [
    "Centre", "Tamdja", "Djeleng", "Kamkop", "Ngouache",
    "Banengo", "Famla", "Tougang", "Plateau", "Lelem",
    "Wenfou", "Koptchou", "Djeleng Nord", "Djeleng Sud",
    "Nylon", "Nattrakom", "Kwa-Kwa", "Nkou'ou", "Bangoua",
    "Fomkap", "Bamendou", "Nkouoptamo", "Tyo-Ville",
    "Kamkop Village", "Kouokoue", "Koupa", "Ngoumou", "Nietche", "Batoufam", "Kouogouo", "Hiala"
  ],
  "Buea": [
    "Molyko", "Great Soppo", "Bonduma", "Mile 16", "Mile 17",
    "Bomaka", "Bokwango", "Buea Town", "Buea Road", "Clerks Quarter",
    "GRA", "Sandpit", "Tole", "Wonyangong", "Muea",
    "Likoko", "Membea", "Lysoka", "Bokova", "Bova",
    "Ewonda", "Muyuka", "Kake", "Sasse", "Wonikang", "Bongo Square", "Small Soppo", "Check Point"
  ],
  "Kribi": [
    "Centre", "Talla", "Mbaa", "Grand Batanga", "Petit Batanga",
    "Mpalla", "Lolabé", "Londji", "Nziou", "Bibamba",
    "Mpolongwe", "Quartier Belle Vue", "Quartier Commerce",
    "Camping", "Nouvelle Route", "Akom II", "Mboa Manga", "Mpang", "Ngoye", "Ocean", "Mbadji", "Dombe", "Bousouma", "Mbeka'a"
  ],
  "Limbe": [
    "Down Beach", "Mile 4", "Clerks Quarter", "Bota",
    "New Town", "Cassava Farm", "GRA", "Church Street",
    "Mabeta", "Motowo", "Half Mile", "Congo Town",
    "Mbende", "Sanje", "Idenau", "Mokundange", "Middle Farm", "Unity Quarters"
  ],
  "Garoua": [
    "Centre", "Lopéré", "Plateau", "Marouaré", "Poumpoumré",
    "Souaré", "Djamboutou", "Bagaladji", "Bocklé",
    "Roumdé Adjia", "Foulbéré", "Dougoy", "Ngong",
    "Bibémi", "Mayo Hourna", "Yelwa", "Caldou", "Djarengol", "Base", "Ouro-Laddeo"
  ],
  "Maroua": [
    "Centre", "Dougoy", "Palar", "Kakataré", "Louggéré",
    "Domayo", "Zokok", "Dougoï", "Bonguel", "Roudouré",
    "Hardé", "Founangué", "Makabaye", "Kodek", "Papata",
    "Pitoa", "Balaza", "Dogba", "Pitoare", "Foumban Road", "Hardjo", "Abattoir", "Drogue", "Doualaré"
  ],
  "Ngaoundéré": [
    "Centre", "Dang", "Mbideng", "Gadamabanga", "Baladji",
    "Jareng", "Boulkitou", "Madiré", "Ngaoundaba", "Martap",
    "Tibati", "Dibi", "Béka", "Sabongari", "Ribeirao"
  ],
  "Bamenda": [
    "Commercial Avenue", "Up Station", "Old Town", "Nkwen",
    "Ntarikon", "Cowbell", "Hospital Area", "Food Market",
    "Mbatu", "Mulang", "Barrack", "Mile 4 Nkwen",
    "Mankon", "Azire", "Pinyin", "Bambui", "Bambili",
    "Bali", "Santa", "Bafut", "Mile 3", "Mile 2", "New Town", "Nitop", "Abangoh"
  ],
  "Bertoua": [
    "Centre", "Nkolbikon", "Haoussa", "Mboukou", "Mokolo",
    "Cité des Sapeurs", "Cité Meiganga", "Mindourou",
    "Doumé", "Abong-Mbang", "Lomié", "Enia", "Bongandé", "Kpokolota"
  ],
  "Ebolowa": [
    "Centre", "Angalé", "Nkoltang", "Nkol-Nnam", "Mengong",
    "Mvangan", "Ambam", "Ma'an", "Meyo-Centre", "Efoulan", "Nko'ovos", "Akak", "Meimbang", "Ebolowa II"
  ],
  "Edéa": [
    "Centre", "Port", "Cité ALUCAM", "Pont-Rail", "Borne 5",
    "Ndog-Bong", "Malimba", "Mouanko", "Dizangué"
  ],
  "Kumba": [
    "Mile 1", "Mile 2", "Mile 3", "Mile 4", "Mile 6",
    "Buea Road", "Fiango", "Mbeng", "Kake",
    "Tiko Road", "Komb", "Mundemba"
  ],
  "Nkongsamba": [
    "Centre", "Bamendjou", "Melong", "Manjo", "Loum",
    "Mbanga", "Njoré", "Bakaka", "Tombel"
  ],
  "Sangmélima": [
    "Centre", "Biba", "Djoum", "Oveng", "Bengbis",
    "Meyomessala", "Zoétélé"
  ],
  "Foumban": [
    "Centre", "Njimom", "Koutaba", "Magba", "Malantouen",
    "Bangourain", "Mvoutte", "Njinka", "Mpepouo", "Aéroport", "Palais"
  ],
  "Dschang": [
    "Centre", "Foto", "Fongo-Tongo", "Santchou", "Kékem",
    "Bafou", "Penka-Michel"
  ],
  "Mbouda": [
    "Centre", "Batcham", "Babadjou", "Bafang", "Bandja",
    "Galim", "Batié"
  ],
  "Tibati": [
    "Centre", "Ngaoundal", "Mbakaou", "Wouldé"
  ],
  "Batouri": [
    "Centre", "Kentzou", "Ndélélé", "Yokadouma",
    "Moloundou", "Nola"
  ],
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

    router.push(`${pathname}?${params.toString()}`);
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