"use client";
import { useEffect } from "react";

interface PageProps {
  params: { id: string };
  // On ajoute currentUser dans les props pour que le composant sache qui regarde
  currentUser: { id: string } | null; 
}

export default function DealPage({ params, currentUser }: PageProps) {
  const dealId = params.id;

  useEffect(() => {
    // On ne track que si on a un utilisateur connecté
    if (currentUser?.id && dealId) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: dealId,
          userId: currentUser.id,
          type: "VIEW"
        })
      }).catch(err => console.error("Erreur tracking view:", err));
    }
  }, [dealId, currentUser?.id]); // On écoute l'ID du user spécifiquement

  const handleChatClick = async () => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour discuter avec le vendeur.");
      return;
    }

    try {
      await fetch("/api/analytics/track", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dealId, 
          userId: currentUser.id, 
          type: "CHAT" 
        })
      });
      
      // LOGIQUE POUR OUVRIR LE CHAT ICI
      console.log("Tracking CHAT réussi, ouverture de la discussion...");
      
    } catch (err) {
      console.error("Erreur tracking chat:", err);
    }
  };

  return (
    <div className="p-4">
      {/* ... Ton affichage du deal (Images, Prix, Description) ... */}

      <button 
        onClick={handleChatClick}
        className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
      >
        Discuter
      </button>
    </div>
  );
}