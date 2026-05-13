"use client";

// ✅ Import sans accolades car c'est un export par défaut
import kyInstance from "@/lib/ky"; 
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post-details", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}`).json<PostData>(),
    enabled: !!postId,
    // 🛡️ EMPÊCHE LE POST DE DISPARAÎTRE / SAUTER
    staleTime: 1000 * 60 * 5, // Garde les données "fraîches" pendant 5 minutes
    gcTime: 1000 * 60 * 30,    // Garde en mémoire cache pendant 30 minutes
    refetchOnWindowFocus: false, // Ne pas recharger si tu changes d'onglet
    refetchOnReconnect: false,   // Ne pas recharger si la connexion revient
  });
}