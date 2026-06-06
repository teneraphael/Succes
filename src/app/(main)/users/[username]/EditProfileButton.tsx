"use client";

import { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";
import { Pencil } from "lucide-react";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a90e2]/10 hover:bg-[#4a90e2]/20 border border-[#4a90e2]/20 hover:border-[#4a90e2]/40 text-[#4a90e2] transition-all active:scale-95 group"
      >
        <Pencil className="size-3.5 group-hover:rotate-12 transition-transform" />
        <span className="text-[11px] font-black uppercase tracking-widest">
          Modifier
        </span>
      </button>

      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}