"use client";

import useInitializeChatClient from "../app/(main)/messages/useInitializeChatClient";

export default function ChatInitializer() {
  // On appelle le hook ici. Il va se connecter à Stream
  // et lancer handlePermission (Prisma + Stream Device) automatiquement.
  useInitializeChatClient();

  return null; // Ce composant ne dessine rien à l'écran
}