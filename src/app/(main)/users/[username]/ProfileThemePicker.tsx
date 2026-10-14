"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Palette, Check, Loader2, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  PROFILE_COLORS,
  DEFAULT_BANNER_GRADIENT,
  bannerGradient,
} from "@/lib/profileTheme";
import { updateProfileTheme } from "./theme-actions";

export default function ProfileThemePicker({
  currentColor,
}: {
  currentColor: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentColor);
  const [isPending, startTransition] = useTransition();

  function save(color: string | null) {
    startTransition(async () => {
      try {
        await updateProfileTheme(color);
        toast({
          description: color
            ? "Couleur de votre profil mise à jour !"
            : "Couleur par défaut restaurée.",
        });
        setOpen(false);
        router.refresh();
      } catch {
        toast({ variant: "destructive", description: "Une erreur est survenue." });
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setSelected(currentColor);
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          title="Personnaliser la couleur"
          className="size-9 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-[#4a90e2] hover:border-[#4a90e2]/40 transition-all active:scale-95"
        >
          <Palette className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[85vh] overflow-y-auto sm:max-w-xl sm:mx-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-sm font-black uppercase tracking-widest">
            Couleur de votre profil
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5 space-y-5">
          {/* Aperçu */}
          <div
            className="h-24 w-full rounded-2xl relative overflow-hidden border border-border/40 transition-all duration-300"
            style={{
              background: selected ? bannerGradient(selected) : DEFAULT_BANNER_GRADIENT,
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <span className="absolute bottom-2 left-3 text-[10px] font-black uppercase tracking-widest text-white/80">
              Aperçu
            </span>
          </div>

          {/* Palette */}
          <div className="grid grid-cols-6 gap-3">
            {PROFILE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() => setSelected(c.value)}
                className={cn(
                  "aspect-square rounded-full flex items-center justify-center transition-all active:scale-90 ring-offset-2 ring-offset-background",
                  selected === c.value ? "ring-2 ring-foreground scale-110" : "hover:scale-105"
                )}
                style={{ backgroundColor: c.value }}
              >
                {selected === c.value && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>

          {/* Couleur personnalisée */}
          <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 cursor-pointer">
            <span className="text-xs font-bold text-foreground">Autre couleur</span>
            <input
              type="color"
              value={selected ?? "#4a90e2"}
              onChange={(e) => setSelected(e.target.value)}
              className="h-8 w-12 rounded-lg border-0 bg-transparent cursor-pointer"
            />
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => save(null)}
              className="h-11 px-4 rounded-xl border border-border/60 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              Par défaut
            </button>
            <button
              type="button"
              disabled={isPending || !selected}
              onClick={() => save(selected)}
              className="flex-1 h-11 rounded-xl bg-[#4a90e2] hover:bg-[#357abd] text-white text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}