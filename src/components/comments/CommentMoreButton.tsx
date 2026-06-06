"use client";

import { CommentData } from "@/lib/types";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteCommentDialog from "./DeleteCommentDialog";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* ✅ Bouton options — style DealCity, sans Button shadcn */}
          <button
            className={`p-1.5 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all active:scale-90 outline-none ${className}`}
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>

        {/* ✅ Menu déroulant — style cohérent DealCity */}
        <DropdownMenuContent
          align="end"
          className="rounded-2xl border border-border/60 shadow-lg p-1 min-w-[140px]"
        >
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-red-500 hover:text-red-500 hover:bg-red-500/8 cursor-pointer transition-colors"
          >
            <Trash2 className="size-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Supprimer
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}