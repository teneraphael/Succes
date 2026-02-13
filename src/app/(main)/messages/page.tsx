"use client";

import { useSearchParams } from "next/navigation";
import Chat from "./Chat";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  
  // On récupère l'ID de l'utilisateur depuis l'URL (ex: /messages?userId=123)
  const selectedUserId = searchParams.get("userId");

  return (
    // Le conteneur parent doit faire 100% de la hauteur pour que le chat puisse 
    // utiliser h-full et s'afficher correctement.
    <div className="h-screen w-full bg-background">
      <Chat initialSelectedUserId={selectedUserId} />
    </div>
  );
}