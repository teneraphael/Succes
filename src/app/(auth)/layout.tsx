import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  // Si une session existe déjà, on redirige vers l'accueil
  if (session) {
    redirect("/");
  }

  return (
    // On ajoute bg-background et text-foreground (standard shadcn) 
    // ou bg-white dark:bg-black pour un contrôle manuel.
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        {/* Un conteneur optionnel pour centrer tes formulaires avec un style cohérent */}
        <div className="w-full max-w-[450px]">
          {children}
        </div>
      </main>
    </div>
  );
}