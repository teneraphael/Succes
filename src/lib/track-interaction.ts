export type InteractionType =
  | "IMPRESSION"
  | "VIEW"
  | "LIKE"
  | "FAVORITE"
  | "CHAT"
  | "PROFILE_VIEW"
  | "ORDER_STARTED"
  | "ORDER_COMPLETED";

type TrackInteractionInput = {
  postId: string;
  type: InteractionType;
  duration?: number;
  metadata?: Record<string, unknown>;
};

export async function trackInteraction(
  input: TrackInteractionInput
) {
  try {
    await fetch("/api/interactions", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),

      /**
       * Important :
       * ne bloque pas l'interface utilisateur.
       */
      keepalive: true,
    });

  } catch (error) {
    console.error(
      "Erreur tracking interaction:",
      error
    );
  }
}