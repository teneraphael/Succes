"use client";

import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    // On retire "staleTime: Infinity" pour permettre à l'invalidation de forcer un rechargement réseau.
    // Tu peux mettre une petite valeur (ex: 30 secondes) si tu veux éviter des requêtes répétitives :
    staleTime: 1000 * 30, // 30 secondes de fraîcheur, mais l'invalidation forcera quand même un refresh !
  });

  return query;
}