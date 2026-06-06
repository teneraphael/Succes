import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Notifications from "./Notifications";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications — DealCity",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5 items-start">

      <div className="w-full min-w-0 space-y-4">

        {/* En-tête */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
            <Bell className="size-4 text-[#4a90e2]" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-foreground leading-none">
              Centre d&apos;alertes
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Suis l&apos;activité de ta vitrine en temps réel.
            </p>
          </div>
        </div>

        <Notifications />
      </div>

      <TrendsSidebar />
    </main>
  );
}