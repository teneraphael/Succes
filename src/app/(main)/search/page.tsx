import { Metadata } from "next";
import SearchResults from "./SearchResults";

interface PageProps {
  searchParams: { q: string };
}

export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  return {
    title: q ? `"${q}" — DealCity` : "Rechercher — DealCity",
  };
}

export default function Page({ searchParams: { q } }: PageProps) {
  return (
    <main className="w-full min-w-0">
      <SearchResults query={q} />
    </main>
  );
}