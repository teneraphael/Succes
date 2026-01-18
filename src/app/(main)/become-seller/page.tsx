"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BecomeSellerPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        window.location.href = "/"; // Recharge proprement pour rafraîchir la session
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] p-6 font-sans">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo DealCity (Identique au Signup) */}
        <div className="flex items-end gap-2 mb-8">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-full"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-full"></div>
          </div>
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        <h1 className="text-[#4a90e2] text-[26px] font-bold mb-6 text-center">
          Devenir Vendeur
        </h1>

        <form onSubmit={onSubmit} className="w-full space-y-4 mb-6">
          <Input 
            name="businessName" 
            placeholder="Nom de l'entreprise" 
            required 
            className="h-12 border-none bg-white rounded-xl shadow-sm"
          />
          <Input 
            name="businessDomain" 
            placeholder="Domaine (ex: Tech, Immobilier)" 
            required 
            className="h-12 border-none bg-white rounded-xl shadow-sm"
          />
          <Input 
            name="businessEmail" 
            type="email" 
            placeholder="Email professionnel" 
            required 
            className="h-12 border-none bg-white rounded-xl shadow-sm"
          />
          <Textarea 
            name="businessProducts" 
            placeholder="Description des produits" 
            className="border-none bg-white rounded-xl shadow-sm min-h-[100px]"
          />
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold rounded-xl text-lg transition-all"
          >
            {loading ? "Traitement..." : "Confirmer l'inscription"}
          </Button>
        </form>
      </div>
    </main>
  );
}