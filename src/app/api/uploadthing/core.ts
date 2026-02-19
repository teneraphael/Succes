import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { MediaType } from "@prisma/client"; // Importation du type depuis Prisma

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

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: { avatarUrl: newAvatarUrl },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: { image: newAvatarUrl },
        }),
      ]);

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
      // Détection précise du type pour la base de données
      let detectedType: MediaType;
      
      if (file.type.startsWith("video")) {
        detectedType = "VIDEO" as MediaType;
      } else if (file.type.startsWith("audio")) {
        detectedType = "AUDIO" as MediaType; // Assure-toi d'avoir fait npx prisma db push
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