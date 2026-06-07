import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Notifications from "./Notifications";
import NotificationsHeader from "./NotificationsHeader";

export const metadata: Metadata = {
  title: "Notifications — DealCity",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5 items-start">
      <div className="w-full min-w-0 space-y-4">

        {/* ✅ En-tête traduit via composant client */}
        <NotificationsHeader />

        <Notifications />
      </div>

      <TrendsSidebar />
    </main>
  );
}