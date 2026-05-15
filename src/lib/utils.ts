import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

/**
 * Mélange intelligemment les classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date de manière relative (ex: "il y a 2h") 
 * ou absolue si plus de 24h (ex: "15 mai")
 */
export function formatRelativeDate(from: Date | string | number) {
  const currentDate = new Date();
  
  // ✅ CORRECTION : Convertit l'entrée en Date au cas où Prisma envoie un String
  const dateFrom = new Date(from);

  // Sécurité : si la date est invalide, on ne fait pas planter l'app
  if (isNaN(dateFrom.getTime())) {
    return "Date inconnue";
  }

  if (currentDate.getTime() - dateFrom.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(dateFrom, { addSuffix: true });
  } else {
    // ✅ CORRECTION : Utilisation de 'format' (nom correct dans date-fns)
    if (currentDate.getFullYear() === dateFrom.getFullYear()) {
      return format(dateFrom, "MMM d");
    } else {
      return format(dateFrom, "MMM d, yyyy");
    }
  }
}

/**
 * Formate les nombres de manière compacte (ex: 1.5k, 2M)
 */
export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Transforme une chaîne en slug (ex: "Mon Article" -> "mon-article")
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}