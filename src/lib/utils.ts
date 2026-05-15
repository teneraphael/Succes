import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale"; // Import de la locale française pour DealCity
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
  // ✅ SÉCURITÉ : Conversion immédiate en Date
  const dateFrom = new Date(from);
  const currentDate = new Date();

  // ✅ SÉCURITÉ : Si la date est invalide (null, undefined, mauvaise string)
  if (isNaN(dateFrom.getTime())) {
    return "Date inconnue";
  }

  const diffInMs = currentDate.getTime() - dateFrom.getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000;

  // Option pour date-fns : français et suffixe "il y a"
  const options = { addSuffix: true, locale: fr };

  try {
    if (diffInMs < oneDayInMs) {
      // Moins de 24h : "il y a 2h", "il y a 5 min"
      return formatDistanceToNowStrict(dateFrom, options);
    } else {
      // Plus de 24h
      if (currentDate.getFullYear() === dateFrom.getFullYear()) {
        // Cette année : "15 mai"
        return format(dateFrom, "d MMM", { locale: fr });
      } else {
        // Années précédentes : "15 mai 2023"
        return format(dateFrom, "d MMM yyyy", { locale: fr });
      }
    }
  } catch (error) {
    // En cas d'erreur de formatage imprévue sur Android
    console.error("Erreur formatage date:", error);
    return "Récemment";
  }
}

/**
 * Formate les nombres de manière compacte (ex: 1.5k, 2M)
 */
export function formatNumber(n: number): string {
  return Intl.NumberFormat("fr-FR", {
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
    .trim()
    .replace(/\s+/g, "-")           // Remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, "")       // Supprime les caractères non-alphanumériques
    .replace(/\-\-+/g, "-")         // Remplace les doubles tirets par un seul
    .replace(/^-+/, "")             // Supprime les tirets au début
    .replace(/-+$/, "");            // Supprime les tirets à la fin
}