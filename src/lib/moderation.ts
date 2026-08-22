import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function moderatePostContent(
  content: string, 
  mediaUrls?: { url: string; type: "IMAGE" | "VIDEO" }[]
): Promise<{ isAllowed: boolean; reason?: string }> {
  try {
    if (!content || content.trim().length < 3) {
      return { isAllowed: false, reason: "Le contenu de l'annonce est trop court." };
    }

    const contents: any[] = [];

    // Traitement des images pour vérifier les filigranes
    if (mediaUrls && mediaUrls.length > 0) {
      for (const media of mediaUrls) {
        try {
          if (media.type === "IMAGE") {
            const imageRes = await fetch(media.url);
            const arrayBuffer = await imageRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

            contents.push({
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            });
          }
        } catch (err) {
          console.error("Erreur chargement image pour modération:", err);
        }
      }
    }

    const prompt = `
      Tu es le modérateur en chef de DealCity, une application de commerce local et de petites annonces.
      Analyse cette publication.

      RÈGLES ABSOLUES :
      1. OFFRE DE VENTE / SERVICE OBLIGATOIRE : Le post DOIT impérativement proposer un produit à vendre, un bien immobilier, un véhicule ou un service commercial. 
      Sont STRICTEMENT INTERDITS : les statuts d'humeur, les salutations ("bonjour à tous"), les blagues, les citations, les discussions générales ou tout texte qui ne vend rien.
      2. PAS DE FILIGRANE : Les images ne doivent pas contenir de filigranes ou logos de sites tiers.

      Texte du post : "${content}"

      Tu dois répondre UNIQUEMENT au format JSON valide, sans texte autour, avec cette structure exacte :
      {
        "isAllowed": false,
        "reason": "Explique clairement pourquoi le post est refusé (ex: 'Votre publication ne propose aucun produit ou service à la vente. DealCity est réservé exclusivement aux annonces commerciales.')."
      }
      OU si c'est une véritable vente :
      {
        "isAllowed": true,
        "reason": ""
      }
    `;

    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      // Sécurité : si l'IA ne répond rien, par défaut on REFUSE pour protéger la marketplace
      return { isAllowed: false, reason: "L'IA n'a pas pu valider votre annonce. Veuillez réessayer." };
    }

    const evaluation = JSON.parse(resultText);
    return {
      isAllowed: Boolean(evaluation.isAllowed),
      reason: evaluation.reason || "Publication non conforme aux règles de DealCity.",
    };
  } catch (error) {
    console.error("Erreur critique modération IA:", error);
    // 🛡️ CHANGEMENT MAJEUR : En cas de panne ou d'erreur technique, on BLOQUE par sécurité
    return { 
      isAllowed: false, 
      reason: "Erreur lors de la vérification de l'annonce par l'IA. Veuillez réessayer dans quelques instants." 
    };
  }
}