import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { MediaType } from "@prisma/client";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";

const f = createUploadthing();
const utapi = new UTApi();

// Dossier temporaire pour le rendu des filigranes vidéo
const TEMP_DIR = path.join(process.cwd(), "public/uploads/temp");
// Chemin absolu vers ton logo officiel dans le dossier public
const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

// 🪄 PROCESSOR DE FILIGRANE AVEC TON LOGO INTERNE
async function processMediaWithLogoWatermark(fileUrl: string, fileType: string, fileName: string): Promise<{ buffer: Buffer; cleanUp?: () => Promise<void> }> {
  // Petite pause de sécurité de 300ms pour s'assurer que le fichier initial est totalement accessible sur le cloud
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Impossible de récupérer le fichier sur UploadThing: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.mkdir(TEMP_DIR, { recursive: true });
  const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;

  // Vérification de sécurité : le logo officiel doit exister pour appliquer le traitement
  try {
    await fs.access(LOGO_PATH);
  } catch {
    console.error(`⚠️ Logo introuvable à l'emplacement réglementaire : ${LOGO_PATH}. Sauvegarde du fichier brut sans filigrane.`);
    return { buffer };
  }

  // --- TRAITEMENT IMAGE ---
  if (fileType.startsWith("image/")) {
    // Redimensionne proprement le logo à 180px pour une visibilité accrue et applique une opacité de 70%
    const resizedLogoBuffer = await sharp(LOGO_PATH)
      .resize({ width: 180, fit: "inside" })
      .ensureAlpha(0.7)
      .toBuffer();

    const processedBuffer = await sharp(buffer)
      .composite([{ 
        input: resizedLogoBuffer, 
        gravity: "southeast" // Position : En bas à droite de la photo du produit
      }])
      .toBuffer();

    return { buffer: processedBuffer };
  }

  // --- TRAITEMENT VIDÉO ---
  if (fileType.startsWith("video/")) {
    const ext = path.extname(fileName) || ".mp4";
    const tempInputPath = path.join(TEMP_DIR, `in-${uniqueId}${ext}`);
    const tempOutputPath = path.join(TEMP_DIR, `out-${uniqueId}${ext}`);

    await fs.writeFile(tempInputPath, buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .input(LOGO_PATH)
        .complexFilter([
          // Redimensionne le logo à 150px de large à la volée et le cale en bas à droite à 20px des bords
          "[1:v]scale=150:-1[wm];[0:v][wm]overlay=W-w-20:H-h-20"
        ])
        .output(tempOutputPath)
        .on("end", async () => {
          try {
            const processedBuffer = await fs.readFile(tempOutputPath);
            
            const cleanUp = async () => {
              await fs.unlink(tempInputPath).catch(() => {});
              await fs.unlink(tempOutputPath).catch(() => {});
            };

            resolve({ buffer: processedBuffer, cleanUp });
          } catch (err) {
            reject(err);
          }
        })
        .on("error", async (err) => {
          await fs.unlink(tempInputPath).catch(() => {});
          await fs.unlink(tempOutputPath).catch(() => {});
          reject(err);
        })
        .run();
    });
  }

  return { buffer };
}

export const fileRouter = {
  // --- UPLOAD AVATAR (Pas de filigrane sur la photo de profil) ---
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        if (key) await utapi.deleteFiles(key);
      }

      const newAvatarUrl = file.ufsUrl.replace(
        `/b/`,
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { avatarUrl: newAvatarUrl },
      });

      return { avatarUrl: newAvatarUrl };
    }),

  // --- UPLOAD BANNIÈRE / COVER COUVERTURE (Pas de filigrane) ---
  coverPicture: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      
      // On récupère l'utilisateur actuel en BDD pour obtenir l'ancienne coverUrl au besoin
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, coverUrl: true }
      });
      
      if (!dbUser) throw new UploadThingError("User not found");
      return { user: dbUser };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Cast explicite en string | null pour empêcher l'inférence en type 'never'
      const oldCoverUrl = metadata.user.coverUrl as string | null;

      // Nettoyage de l'ancienne image de couverture si elle existait sur UploadThing
      if (oldCoverUrl) {
        const key = oldCoverUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        if (key) await utapi.deleteFiles(key).catch((e) => console.error("Erreur suppression ancienne cover:", e));
      }

      // Formatage de la nouvelle URL personnalisée sécurisée
      const newCoverUrl = file.ufsUrl.replace(
        `/b/`,
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      // Enregistrement en base de données
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { coverUrl: newCoverUrl },
      });

      return { coverUrl: newCoverUrl };
    }),

  // --- UPLOAD STUDIO (MULTIMÉDIA FILIGRANÉ AVEC TON LOGO PROPRE) ---
  attachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "512MB", maxFileCount: 5 },
    audio: { maxFileSize: "32MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      let detectedType: MediaType;
      let finalUrl = file.ufsUrl.replace(`/b/`, `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`);

      if (file.type.startsWith("video")) {
        detectedType = "VIDEO" as MediaType;
      } else if (file.type.startsWith("audio")) {
        detectedType = "AUDIO" as MediaType;
      } else {
        detectedType = "IMAGE" as MediaType;
      }

      // Application du logo en filigrane uniquement pour les images et vidéos
      if (detectedType === "IMAGE" || detectedType === "VIDEO") {
        try {
          // 1. Appliquer le filigrane image/vidéo à partir de ton logo.png
          const { buffer: processedBuffer, cleanUp } = await processMediaWithLogoWatermark(file.ufsUrl, file.type, file.name);

          // 2. Transformer le buffer traité en Uint8Array pour satisfaire le type BlobPart du constructeur File Web
          const uploadFile = new File([new Uint8Array(processedBuffer)], file.name, { type: file.type });
          
          // 3. Envoyer la version modifiée finale vers les serveurs cloud d'UploadThing
          const uploadResponse = await utapi.uploadFiles(uploadFile);

          if (uploadResponse.data) {
            // 4. Supprimer le fichier d'origine brut pour éviter de saturer ton espace de stockage
            const originalKey = file.ufsUrl.split("/b/")[1];
            if (originalKey) {
              await utapi.deleteFiles(originalKey).catch((e) => console.error("Erreur suppression du doublon brut :", e));
            }

            // 5. Récupérer l'URL finale optimisée et marquée
            finalUrl = uploadResponse.data.ufsUrl.replace(
              `/b/`,
              `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
            );
          }

          // Nettoyage complet des résidus vidéo sur le serveur local
          if (cleanUp) await cleanUp();

        } catch (error) {
          console.error("Échec du traitement du filigrane, sauvegarde sécurisée du fichier d'origine :", error);
        }
      }

      // Enregistrement de la référence média finale dans ta base de données Prisma
      const media = await prisma.media.create({
        data: {
          url: finalUrl,
          type: detectedType,
        },
      });

      // 🔥 CRUCIAL : On renvoie le mediaId au client pour alimenter l'état local dans useMediaUpload
      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;