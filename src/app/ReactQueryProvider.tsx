"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Indispensable pour la persistance
            gcTime: 1000 * 60 * 60 * 24, // Garde les données en cache 24h
            staleTime: 1000 * 60 * 5,    // Considère les données fraîches pendant 5 min
            retry: 3,                   // Réessaye 3 fois si le réseau dérange
          },
        },
      })
  );

  // Configuration du stockage local (localStorage)
  // On vérifie "typeof window" pour éviter les erreurs lors du rendu côté serveur (SSR)
  const persister = typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
      })
    : undefined;

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ 
        persister: persister!,
        maxAge: 1000 * 60 * 60 * 24 // Durée de vie du stockage local : 24h
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}