import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Créer un compte - DealCity",
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] p-6 font-sans">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo DealCity */}
        <div className="flex items-end gap-2 mb-12">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-full"></div>
          </div>
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        {/* Titre Créer un compte */}
        <h1 className="text-[#4a90e2] text-[26px] font-bold mb-10 text-center">
          Créer un compte
        </h1>

        {/* Le formulaire */}
        <div className="w-full mb-10">
          <SignUpForm />
        </div>

        {/* Lien de pied de page */}
        <p className="text-[#4b5563] text-sm">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-[#4a90e2] font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}