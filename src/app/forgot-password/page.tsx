import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Récupération - DealCity",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] p-6 font-sans relative">
      
      <Link 
        href="/login" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[#4b5563] hover:text-[#4a90e2] transition-colors group"
      >
        <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
          <ArrowLeft size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Retour</span>
      </Link>

      <div className="w-full max-w-[400px] flex flex-col items-center">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-[#4a90e2] text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Un oubli ?
          </h1>
          <p className="text-sm text-[#4b5563]/70 font-medium">
            Entrez votre email pour recevoir un code à 6 chiffres.
          </p>
        </div>

        <div className="w-full mb-10 bg-white p-2 rounded-[2.5rem] shadow-xl shadow-[#4a90e2]/5">
          <div className="bg-white rounded-[2.3rem] p-6">
             <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}