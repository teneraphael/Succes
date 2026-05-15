import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { MediaType } from "@prisma/client";

const f = createUploadthing();

export const fileRouter = {
  // --- UPLOAD AVATAR ---
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

      // Suppression de l'ancien fichier sur UploadThing pour ne pas gaspiller d'espace
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        if (key) await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = file.ufsUrl.replace(
        `/b/`,
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      // CORRECTION : On ne met à jour que Prisma. 
      // L'appel à streamServerClient a été supprimé pour éviter les erreurs de timeout.
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { avatarUrl: newAvatarUrl },
      });

      return { avatarUrl: newAvatarUrl };
    }),

  // --- UPLOAD STUDIO (MULTIMÉDIA) ---
  attachment: f({
    image: { 
      maxFileSize: "16MB", 
      maxFileCount: 10 
    },
    video: { 
      maxFileSize: "512MB", 
      maxFileCount: 5 
    },
    audio: {
      maxFileSize: "32MB",
      maxFileCount: 1
    }
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Détection du type pour la base de données
      let detectedType: MediaType;
      
      if (file.type.startsWith("video")) {
        detectedType = "VIDEO" as MediaType;
      } else if (file.type.startsWith("audio")) {
        detectedType = "AUDIO" as MediaType;
      } else {
        detectedType = "IMAGE" as MediaType;
      }

      const media = await prisma.media.create({
        data: {
          url: file.ufsUrl.replace(
            `/b/`,
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: detectedType,
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;