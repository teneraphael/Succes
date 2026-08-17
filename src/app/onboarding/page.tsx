"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, SkipForward } from "lucide-react";

// Tu peux réutiliser ton objet CAMEROON_LOCATIONS ici
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

export default function OnboardingLocationPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const availableNeighborhoods = city ? CAMEROON_LOCATIONS[city] || [] : [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    // Enregistrer dans un cookie (valable 1 an) pour que le serveur lise la position direct
    document.cookie = `user_city=${city}; path=/; max-age=31536000`;
    if (neighborhood) {
      document.cookie = `user_neighborhood=${neighborhood}; path=/; max-age=31536000`;
    }

    // Rediriger vers l'accueil avec les filtres pré-remplis dans l'URL (ou juste l'accueil)
    router.push(`/?city=${encodeURIComponent(city)}${neighborhood ? `&neighborhood=${encodeURIComponent(neighborhood)}` : ""}`);
    router.refresh();
  };

  const handleSkip = () => {
    // Cookie pour ne plus forcer l'onboarding si l'utilisateur refuse
    document.cookie = `skip_location_onboarding=true; path=/; max-age=86400`; // 1 jour
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/50 text-[#3a81f3] rounded-2xl mb-2">
            <MapPin className="size-8 animate-bounce" />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Où vous situez-vous ?
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Pour vous montrer en priorité les bonnes affaires et les vendeurs près de chez vous au Cameroun.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Votre Ville</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setNeighborhood(""); // Reset quartier si ville change
              }}
              required
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3a81f3]"
            >
              <option value="">Sélectionnez votre ville</option>
              {Object.keys(CAMEROON_LOCATIONS).sort().map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {city && availableNeighborhoods.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Votre Quartier (Optionnel)</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-blue-50/50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3a81f3]"
              >
                <option value="">Tous les quartiers de {city}</option>
                {availableNeighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={!city}
            className="w-full flex items-center justify-center gap-2 bg-[#3a81f3] hover:bg-[#2a6fd1] disabled:opacity-50 text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3a81f3]/25 transition-all cursor-pointer"
          >
            <span>Valider et découvrir</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        {/* Bouton Passer / Skip */}
        <div className="text-center pt-2">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
          >
            <SkipForward className="size-3.5" />
            <span>Passer pour l'instant</span>
          </button>
        </div>

      </div>
    </main>
  );
}