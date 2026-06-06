import { PostData } from "@/lib/types";
import LoadingButton from "../LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeletePostMutation } from "./mutations";
import { Trash2 } from "lucide-react";

interface DeletePostDialogProps {
  post: PostData;
  open: boolean;
  onClose: () => void;
}

export default function DeletePostDialog({
  post,
  open,
  onClose,
}: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  // ✅ Extraction du nom du produit pour l'aperçu dans la dialog
  const productMatch = post.content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const productName = productMatch ? productMatch[1].trim() : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border border-border/60 shadow-xl p-0 overflow-hidden max-w-sm">

        {/* ✅ Header avec icône danger */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex justify-center">
            <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 className="size-5 text-red-500" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <DialogTitle className="font-black uppercase tracking-tight text-foreground">
              Supprimer le produit ?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* ✅ Aperçu du produit concerné */}
        {productName && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-2xl bg-muted/40 border border-border/40 flex items-center gap-2">
            <span className="text-base">🛍️</span>
            <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">
              {productName}
            </p>
          </div>
        )}

        {/* ✅ Boutons d'action */}
        <DialogFooter className="px-6 pb-6 flex gap-2 sm:gap-2">
          {/* Annuler */}
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 h-11 rounded-2xl border border-border/60 bg-background hover:bg-muted/50 text-foreground text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>

          {/* ✅ Supprimer — rouge destructif */}
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate(post.id, { onSuccess: onClose })}
            loading={mutation.isPending}
            className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Supprimer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}