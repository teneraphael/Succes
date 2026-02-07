"use client";

import { Session, User as LuciaUser } from "lucia";
import React, { createContext, useContext } from "react";

// On définit notre propre type User qui inclut tes champs personnalisés
interface User extends LuciaUser {
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
  // value contient maintenant { user: User | null, session: Session | null }
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