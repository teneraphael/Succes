"use client";

import { MoreHorizontal } from "lucide-react";

export default function MoreOptionsButton() {
  return (
    <button 
      type="button" 
      onClick={() => alert("Options supplémentaires bientôt disponibles (Signaler, Bloquer...)")}
      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors hidden sm:block shadow-sm"
    >
      <MoreHorizontal className="size-4" />
    </button>
  );
}