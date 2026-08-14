"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";

const CITIES = ["Tous", "Douala", "Yaoundé", "Bafoussam", "Kribi", "Limbé"];

export function CityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city") || "Tous";

  const handleSelect = (city: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (city === "Tous") {
      params.delete("city");
    } else {
      params.set("city", city);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#060C18] border border-white/10 rounded-xl text-white/60 text-xs font-bold shrink-0">
        <MapPin className="size-3.5 text-[#4a90e2]" />
        <span>Ville :</span>
      </div>
      {CITIES.map((city) => {
        const isActive = currentCity === city || (city === "Tous" && !searchParams.get("city"));
        return (
          <button
            key={city}
            onClick={() => handleSelect(city)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              isActive
                ? "bg-[#4a90e2] text-white shadow-md shadow-[#4a90e2]/20"
                : "bg-[#060C18] text-white/70 border border-white/10 hover:border-white/20"
            }`}
          >
            {city}
          </button>
        );
      })}
    </div>
  );
}