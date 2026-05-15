"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // On utilise un useState pour garantir que le QueryClient n'est créé qu'une fois côté client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ✅ On réduit le gcTime pour éviter de garder des données corrompues trop longtemps
            gcTime: 1000 * 60 * 60 * 2, // 2 heures au lieu de 24h
            staleTime: 1000 * 60 * 5,    // 5 minutes
            retry: 1,                   // 1 seul retry pour ne pas bloquer le navigateur mobile
            refetchOnWindowFocus: false, // Très important sur mobile pour éviter les lags
          },
        },
      })
  );

  /**
   * NOTE IMPORTANTE : 
   * J'ai supprimé le PersistQueryClientProvider. 
   * En phase de développement et de correction de bugs critiques, 
   * la persistance dans localStorage réinjecte souvent les anciennes erreurs 
   * qui font planter l'application sur mobile.
   */

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}