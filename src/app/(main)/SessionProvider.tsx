"use client";

import { Session, User as LuciaUser } from "lucia";
import React, { createContext, useContext, useEffect, useState } from "react";
import AppSplashScreen from "@/components/ui/AppSplashScreen"; // 🔥 Importation de ton Splash Screen

// On définit notre propre type User qui inclut tes champs personnalisés
interface User extends LuciaUser {
  isPioneer: boolean;
  isVerified: boolean;
  isSeller: boolean;
  businessName?: string | null;
}

interface SessionContext {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  
  // 🔥 ÉTAT DE CHARGEMENT : Gère le cycle de vie du Splash Screen natif
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Dès que le composant est monté côté client et que la session (value) est reçue,
    // on coupe immédiatement le chargement.
    if (value) {
      setIsAppLoading(false);
    }
  }, [value]);

  return (
    <SessionContext.Provider value={value}>
      {/* 1. Affichage du Splash Screen connecté à l'état de l'application */}
      <AppSplashScreen isLoading={isAppLoading} />

      {/* 2. Affichage conditionnel de l'application pour éviter les sauts d'UI instables */}
      <div className={isAppLoading ? "hidden" : "block"}>
        {children}
      </div>
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}