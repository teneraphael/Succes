import { useEffect, useState } from "react";

/**
 * Hook pour retarder la mise à jour d'une valeur.
 * Utile pour limiter les requêtes API lors de la recherche 
 * ou la validation de formulaires complexes.
 */
export default function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Si la valeur change avant la fin du délai, le timer précédent est annulé
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyage (Cleanup) : évite les fuites de mémoire et les updates inutiles
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}