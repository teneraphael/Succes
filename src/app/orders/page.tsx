import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import OrderConfirmationList from "@/app/(main)/users/[username]/OrderConfirmationList";
import { ArrowLeft, Package, History, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

 return (
    // Ajout de "dark:bg-slate-950" pour le fond global
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation - Texte ajusté pour le dark mode */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-all duration-200"
        >
          <ArrowLeft className="size-4" />
          Retour à la boutique
        </Link>

        {/* En-tête - Fond sombre et bordure sombre */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Package className="size-32" />
          </div>
          <div className="relative flex items-center gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mes commandes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>Historique complet de vos achats</span>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Bienvenue</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section Liste */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="size-5 text-emerald-600 dark:text-emerald-400" />
              Transactions récentes
            </h2>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Dernière mise à jour : maintenant
            </span>
          </div>
          
          <div className="space-y-4">
             {/* Assurez-vous que le composant OrderConfirmationList 
                utilise aussi des classes 'dark:' sur ses propres éléments
             */}
             <OrderConfirmationList userId={user.id} />
          </div>
        </section>
      </div>
    </main>
  );
}