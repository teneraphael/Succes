"use client";

import { Session, User as LuciaUser } from "lucia"; // On renomme pour plus de clarté
import React, { createContext, useContext } from "react";

// On définit notre propre type User qui inclut isSeller
interface User extends LuciaUser {
  isSeller: boolean;
  businessName?: string | null;
  // Ajoute les autres champs business si tu en as besoin côté client
}

interface SessionContext {
  user: User | null;    // Ajoute "| null" ici
  session: Session | null; // Ajoute "| null" ici
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}