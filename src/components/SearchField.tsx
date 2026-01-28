"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

export default function SearchField() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;

    // 🚀 SIGNAL POUR L'ALGO
    // On enregistre la recherche comme une intention forte
    // On peut utiliser un type "SEARCH" ou "VIEW" avec l'ID du premier résultat plus tard, 
    // mais ici on va simplement envoyer les mots-clés au trackeur si tu as une route dédiée.
    // Pour l'instant, on lance la navigation, mais l'algo pourra se baser sur l'URL de recherche.
    
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <Input name="q" placeholder="Search" className="pe-10" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}