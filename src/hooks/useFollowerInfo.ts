"use client";

import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  return useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    // Forces le rechargement dès que tu montes le composant
    refetchOnMount: "always", 
    // Réduit le staleTime à 0 pour éviter de servir des données potentiellement 
    // périmées venant du cache du fil vers le profil
    staleTime: 0, 
  });
}