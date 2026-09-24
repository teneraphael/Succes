export const POST_CATEGORIES = [
  "ÉLECTRONIQUE", "MODE", "MAISON", "VÉHICULES", "IMMOBILIER",
  "BEAUTÉ", "ALIMENTATION", "SERVICES", "DIVERS",
] as const;

export function getPostCategory(value: unknown): string {
  return typeof value === "string" && POST_CATEGORIES.includes(value as typeof POST_CATEGORIES[number])
    ? value : "DIVERS";
}
