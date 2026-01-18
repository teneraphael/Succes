"use client";

import { useEffect } from "react";
import { handlePermission } from "@/lib/fcm"; // Ta fonction Firebase
import { useSession } from "@/app/(main)/SessionProvider"; // <--- VÉRIFIE CE CHEMIN

export default function NotificationHandler() {
  const { user } = useSession();

  useEffect(() => {
    // Si Lucia a bien détecté un utilisateur connecté
    if (user && user.id) {
      console.log("Activation des notifications pour :", user.displayName);
      handlePermission(user.id);
    }
  }, [user]);

  return null;
}