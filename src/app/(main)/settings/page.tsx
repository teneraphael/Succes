"use client"; // <--- INDISPENSABLE car tu as du JS interactif (onClick, confirm)

import { 
  UserCircle, 
  BellRing, 
  ShieldCheck, 
  FileSignature, 
  LogOut, 
  ChevronRight,
  Trash2,
  LockKeyhole
} from "lucide-react";
import { deleteAccount } from "./actions"; // Ton action de suppression
import { logout } from "@/app/(auth)/actions"; // Ton action de logout
import Link from "next/link";

export default function SettingsPage() {
  
  // Handler pour la suppression avec confirmation
  const handleDeleteAction = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte définitivement ? Cette action est irréversible.")) {
      try {
        await deleteAccount();
      } catch (error) {
        alert("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      {/* Header avec ton style bleu emblématique */}
      <div className="px-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#4a90e2]">Settings</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Gestion du compte DealCity</p>
      </div>

      {/* GROUPE 1 : MON COMPTE */}
      <div className="space-y-2">
        <p className="ml-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mon Compte</p>
        <div className="bg-muted/30 rounded-[2rem] border border-border overflow-hidden">
          <Link href="/user/profile" className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all border-b">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600">
                <UserCircle size={22} />
              </div>
              <span className="font-bold text-sm">Modifier le profil public</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          <Link href="/settings/security" className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-2 rounded-xl text-green-600">
                <LockKeyhole size={22} />
              </div>
              <span className="font-bold text-sm">Sécurité & Mot de passe</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* GROUPE 2 : APPLICATION */}
      <div className="space-y-2">
        <p className="ml-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Application</p>
        <div className="bg-muted/30 rounded-[2rem] border border-border overflow-hidden">
          <Link href="/settings/notifications" className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all border-b">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-2 rounded-xl text-orange-600">
                <BellRing size={22} />
              </div>
              <span className="font-bold text-sm">Notifications Push</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          <Link href="/confidentialite" className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all border-b">
            <div className="flex items-center gap-4">
              <div className="bg-slate-500/10 p-2 rounded-xl text-slate-600">
                <ShieldCheck size={22} />
              </div>
              <span className="font-bold text-sm">Confidentialité</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          <Link href="/mentions-legales" className="flex items-center justify-between p-5 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-slate-500/10 p-2 rounded-xl text-slate-600">
                <FileSignature size={22} />
              </div>
              <span className="font-bold text-sm">Mentions Légales</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* GROUPE 3 : ACTIONS DANGEREUSES */}
      <div className="pt-4 pb-10">
        <div className="bg-destructive/5 rounded-[2rem] border border-destructive/10 overflow-hidden">
          {/* Logout via action serveur */}
          <button 
            onClick={() => logout()} 
            className="w-full flex items-center gap-4 p-5 text-destructive hover:bg-destructive/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={20} />
            Se déconnecter
          </button>
          
          {/* Delete Account */}
          <button 
            onClick={handleDeleteAction}
            className="w-full flex items-center gap-4 p-5 text-destructive/60 hover:bg-destructive/20 transition-all font-bold text-xs uppercase tracking-widest border-t border-destructive/10"
          >
            <Trash2 size={20} />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}