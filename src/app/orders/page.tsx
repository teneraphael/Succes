import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import OrderConfirmationList from "@/app/(main)/users/[username]/OrderConfirmationList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) redirect("/login");

  return (
    <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Bouton retour */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="size-4" />
        Retour à l&apos;accueil
      </Link>

      {/* En-tête épuré */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Mes commandes
        </h1>
        <p className="text-slate-500 text-sm">
          Retrouvez ici l&apos;historique et le suivi de vos achats.
        </p>
      </div>

      {/* Liste des commandes sans le fond blanc rigide */}
      <div className="w-full">
        <OrderConfirmationList userId={user.id} />
      </div>
    </main>
  );
}