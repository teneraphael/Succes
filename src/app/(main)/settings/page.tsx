"use client";

import {
  UserCircle,
  BellRing,
  ShieldCheck,
  FileSignature,
  LogOut,
  ChevronRight,
  Trash2,
  LockKeyhole,
  Settings,
} from "lucide-react";
import { deleteAccount } from "./actions";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";

export default function SettingsPage() {
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

      {/* Titre */}
      <div className="flex items-center gap-3 px-1">
        <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
          <Settings className="size-4 text-[#4a90e2]" />
        </div>
        <div>
          <h1 className="text-base font-black uppercase tracking-tight text-foreground leading-none">
            Paramètres
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Gestion du compte DealCity
          </p>
        </div>
      </div>

      {/* Groupe 1 : Mon Compte */}
      <div className="space-y-2">
        <p className="ml-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Mon Compte
        </p>
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <Link
            href="/user/profile"
            className="flex items-center justify-between p-4 hover:bg-[#4a90e2]/[0.03] transition-all border-b border-border/40 group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-[#4a90e2]/10 rounded-xl flex items-center justify-center border border-[#4a90e2]/15">
                <UserCircle className="size-4 text-[#4a90e2]" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-[#4a90e2] transition-colors">
                Modifier le profil public
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#4a90e2] transition-colors" />
          </Link>

          <Link
            href="/settings/security"
            className="flex items-center justify-between p-4 hover:bg-[#6ab344]/[0.03] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-[#6ab344]/10 rounded-xl flex items-center justify-center border border-[#6ab344]/15">
                <LockKeyhole className="size-4 text-[#6ab344]" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-[#6ab344] transition-colors">
                Sécurité & Mot de passe
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#6ab344] transition-colors" />
          </Link>
        </div>
      </div>

      {/* Groupe 2 : Application */}
      <div className="space-y-2">
        <p className="ml-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Application
        </p>
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <Link
            href="/settings/notifications"
            className="flex items-center justify-between p-4 hover:bg-[#4a90e2]/[0.03] transition-all border-b border-border/40 group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/15">
                <BellRing className="size-4 text-orange-500" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-[#4a90e2] transition-colors">
                Notifications Push
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#4a90e2] transition-colors" />
          </Link>

          <Link
            href="/confidentialite"
            className="flex items-center justify-between p-4 hover:bg-[#4a90e2]/[0.03] transition-all border-b border-border/40 group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-slate-500/10 rounded-xl flex items-center justify-center border border-slate-500/15">
                <ShieldCheck className="size-4 text-slate-500" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-[#4a90e2] transition-colors">
                Confidentialité
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#4a90e2] transition-colors" />
          </Link>

          <Link
            href="/mentions-legales"
            className="flex items-center justify-between p-4 hover:bg-[#4a90e2]/[0.03] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-slate-500/10 rounded-xl flex items-center justify-center border border-slate-500/15">
                <FileSignature className="size-4 text-slate-500" />
              </div>
              <span className="font-bold text-sm text-foreground group-hover:text-[#4a90e2] transition-colors">
                Mentions Légales
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#4a90e2] transition-colors" />
          </Link>
        </div>
      </div>

      {/* Groupe 3 : Actions dangereuses */}
      <div className="space-y-2 pb-10">
        <p className="ml-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Session
        </p>
        <div className="bg-card rounded-3xl border border-red-200/50 dark:border-red-900/20 shadow-sm overflow-hidden">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-b border-red-100 dark:border-red-900/20 group"
          >
            <div className="size-9 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/15">
              <LogOut className="size-4 text-red-500" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-red-500">
              Se déconnecter
            </span>
          </button>

          <button
            onClick={handleDeleteAction}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
          >
            <div className="size-9 bg-red-500/5 rounded-xl flex items-center justify-center border border-red-500/10">
              <Trash2 className="size-4 text-red-400/60" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-red-400/60">
              Supprimer mon compte
            </span>
          </button>
        </div>
      </div>

      {/* Badge DealCity */}
      <div className="flex items-center justify-center gap-3 py-2 opacity-40">
        <div className="h-px w-10 bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-[3px]">
            <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
            <div className="w-[4px] h-3.5 bg-[#4a90e2] rounded-sm" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            DealCity
          </span>
        </div>
        <div className="h-px w-10 bg-border" />
      </div>

    </div>
  );
}