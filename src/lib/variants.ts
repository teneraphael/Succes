// lib/variants.ts

export interface IncomingAttribute {
  name: string;   // ex: "Taille"
  values: string[]; // ex: ["M", "L"]
}

/**
 * Génère le produit cartésien des attributs fournis.
 * Utilise une approche itérative pour garantir la performance.
 */
export function generateCombinations(attributes: IncomingAttribute[]): Record<string, string>[] {
  // 1. Filtrer les attributs invalides dès le début
  const validAttributes = attributes.filter(
    (attr) => attr.name.trim() !== "" && attr.values.length > 0
  );

  if (validAttributes.length === 0) return [];

  // 2. Initialisation avec un tableau contenant un objet vide
  let results: Record<string, string>[] = [{}];

  for (const attr of validAttributes) {
    const temp: Record<string, string>[] = [];
    const attributeName = attr.name.trim();
    
    for (const res of results) {
      for (const val of attr.values) {
        temp.push({
          ...res,
          [attributeName]: val.trim()
        });
      }
    }
    results = temp;
  }

  return results;
}