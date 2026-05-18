import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5 items-start">
      
      {/* ZONE CENTRALE DES NOTIFICATIONS */}
      <div className="w-full min-w-0 space-y-4">
        
        {/* EN-TÊTE ÉDITORIAL ET DISCRET */}
        <div className="px-4 sm:px-2 pt-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Centre d'alertes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {`Suis l'activité de ta vitrine et tes interactions en temps réel.`}
          </p>
        </div>

        {/* COMPOSANT FLUX (Déjà configuré avec ses propres bordures et arrondis) */}
        <Notifications />
        
      </div>

      {/* BARRE LATÉRALE DE TENDANCES */}
      <TrendsSidebar />
      
    </main>
  );
}