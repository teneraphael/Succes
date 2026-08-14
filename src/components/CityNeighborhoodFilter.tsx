"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";

// Liste étendue des quartiers pour couvrir l'informel
const CAMEROON_LOCATIONS: Record<string, string[]> = {
  "Douala": [
    "Akwa", "Bonapriso", "Deido", "Bonanjo", "Kotto", "Makepe", "Logpom", "Bependa", 
    "Nylon", "Cité Cicam", "PK8", "PK10", "PK12", "PK14", "Ancien Dalip", "Bali", 
    "Besseke", "Bonamoussadi", "Bonabéri", "Bepanda", "Grand Hangar", "Ndogpassi", 
    "Nyalla", "Village", "Cité des Palmiers", "Makepe Missoke", "Sable","yassa"
  ],
  "Yaoundé": [
    "Bastos", "Biyem-Assi", "Mvan", "Omnisport", "Ngousso", "Messa", "Essos", 
    "Nsimeyong", "Mvog-Mbi", "Etoudi", "Ekounou", "Obobogo", "Mimboman", 
    "Odza", "Ahala", "Elig-Essono", "Elig-Edzoa", "Nkolbisson", "Emana", 
    "Messassi", "Nkolmesseng", "Tsinga", "Nkomkana", "Mvog-Ada"
  ],
  "Bafoussam": [
    "Djeleng", "Tamdja", "Banengo", "Nietche", "Commercial Avenue", "Tougang", 
    "Batoufam", "Kouogouo", "Ngouache", "Hiala"
  ],
  "Bamenda": [
    "Commercial Avenue", "Nkwen", "Mankon", "Mile 4", "Mile 3", "Mile 2", 
    "Up Station", "Old Town", "New Town", "Nitop", "Abangoh"
  ],
  "Garoua": [
    "Yelwa", "Caldou", "Roumde Adjia", "Djarengol", "Marouaré", "Poumpoumré", 
    "Plateau", "Base", "Ouro-Laddeo"
  ],
  "Maroua": [
    "Pitoare", "Domayo", "Foumban Road", "Hardjo", "Abattoir", "Drogue", 
    "Kodek", "Doualaré", "Zokok"
  ],
  "Kribi": [
    "Mboa Manga", "Mpang", "Ngoye", "Ocean", "Mbadji", "Dombe", "Bousouma", 
    "Talla", "Mbeka'a"
  ],
  "Limbé": [
    "Down Beach", "New Town", "Mile 4", "Bota", "Mokundange", "Middle Farm", 
    "Cassava Farms", "Church Street", "Unity Quarters"
  ],
  "Buea": [
    "Molyko", "Clerks Quarters", "Great Soppo", "Bomaka", "Mile 16", "Mile 17", 
    "Bongo Square", "Sandpit", "Small Soppo", "Check Point"
  ],
  "Bertoua": ["Enia", "Mokolo", "Bongandé", "Kpokolota"],
  "Ebolowa": ["Nko'ovos", "Akak", "Meimbang", "Ebolowa II"],
  "Foumban": ["Njinka", "Mpepouo", "Aéroport", "Palais"]
};

export function CityNeighborhoodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get("city") || "";
  const currentNeighborhood = searchParams.get("neighborhood") || "";

  const availableNeighborhoods = (currentCity && CAMEROON_LOCATIONS[currentCity]) 
    ? [...CAMEROON_LOCATIONS[currentCity]].sort() // Tri alphabétique pour faciliter la recherche
    : [];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (!city) {
      params.delete("city");
      params.delete("neighborhood");
    } else {
      params.set("city", city);
      params.delete("neighborhood");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const neighborhood = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (!neighborhood) {
      params.delete("neighborhood");
    } else {
      params.set("neighborhood", neighborhood);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 bg-white dark:bg-[#060C18] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-zinc-300 shrink-0">
        <MapPin className="size-4 text-[#3a81f3]" />
        <span>Localisation :</span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={currentCity}
            onChange={handleCityChange}
            className="w-full sm:w-auto appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#3a81f3] cursor-pointer"
          >
            <option value="">Ville</option>
            {Object.keys(CAMEROON_LOCATIONS).sort().map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
        </div>

        {currentCity && availableNeighborhoods.length > 0 && (
          <div className="relative flex-1 sm:flex-none animate-in fade-in duration-200">
            <select
              value={currentNeighborhood}
              onChange={handleNeighborhoodChange}
              className="w-full sm:w-auto appearance-none bg-blue-50/50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#3a81f3] cursor-pointer"
            >
              <option value="">Quartier</option>
              {availableNeighborhoods.map((neigh) => (
                <option key={neigh} value={neigh}>{neigh}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}