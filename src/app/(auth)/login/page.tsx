import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login - DealCity",
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] p-6 font-sans">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo DealCity avec les barres bleues */}
        <div className="flex items-end gap-2 mb-12">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-sm"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-sm"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-sm"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-sm"></div>
          </div>
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        {/* Titre Bienvenue */}
        <h1 className="text-[#4a90e2] text-[26px] font-bold mb-10 text-center">
          Bienvenue sur DealCity
        </h1>

        {/* Le formulaire */}
        <div className="w-full mb-10">
          <LoginForm />
        </div>

        {/* Lien de pied de page */}
        <p className="text-[#4b5563] text-sm">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-[#4a90e2] font-bold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}