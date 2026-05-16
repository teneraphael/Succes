"use client";

import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
  customId: string; // 🔥 Permet d'identifier le fichier de manière unique entre le client et le serveur
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [audioAttachment, setAudioAttachment] = useState<Attachment | null>(null);

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      // On génère un tableau d'objets contenant le fichier renommé et un customId unique
      const prepared = files.map((file) => {
        const extension = file.name.split(".").pop();
        const prefix = file.type.startsWith("audio") ? "audio" : "attachment";
        const customId = uuidv4();
        
        // On intègre le customId directement dans le nom du fichier lu par UploadThing
        const renamedFile = new File(
          [file],
          `${prefix}_${customId}.${extension}`,
          { type: file.type }
        );

        return { renamedFile, customId };
      });

      const renamedFiles = prepared.map(p => p.renamedFile);

      // On sépare les médias pour l'affichage de l'UI
      const newAttachments = prepared
        .filter(p => !p.renamedFile.type.startsWith("audio"))
        .map(p => ({ file: p.renamedFile, isUploading: true, customId: p.customId }));
      
      const newAudio = prepared
        .filter(p => p.renamedFile.type.startsWith("audio"))
        .map(p => ({ file: p.renamedFile, isUploading: true, customId: p.customId }))[0];

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
      
      if (newAudio) {
        setAudioAttachment(newAudio);
      }

      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      // On extrait le customId depuis le nom du fichier renvoyé par le serveur
      const getCustomIdFromName = (name: string) => {
        const match = name.match(/_(.*?)\./);
        return match ? match[1] : name;
      };

      // 1. Mise à jour des images / vidéos avec l'ID média définitif du serveur
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadResult = res.find((r) => getCustomIdFromName(r.name) === a.customId);
          if (!uploadResult || !uploadResult.serverData) return a;
          return {
            ...a,
            mediaId: uploadResult.serverData.mediaId, // L'ID du média filigrané en BDD
            isUploading: false,
          };
        })
      );

      // 2. Mise à jour de l'audio
      setAudioAttachment((prev) => {
        if (!prev) return null;
        const uploadResult = res.find((r) => getCustomIdFromName(r.name) === prev.customId);
        if (!uploadResult || !uploadResult.serverData) return prev;
        return {
          ...prev,
          mediaId: uploadResult.serverData.mediaId,
          isUploading: false,
        };
      });
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      setAudioAttachment(null);
      toast({
        variant: "destructive",
        description: e.message,
      });
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Un envoi est déjà en cours...",
      });
      return;
    }

    const audioFiles = files.filter(f => f.type.startsWith("audio"));
    const mediaFiles = files.filter(f => !f.type.startsWith("audio"));

    if (attachments.length + mediaFiles.length > 10) {
      toast({
        variant: "destructive",
        description: "Maximum 10 photos/vidéos par annonce.",
      });
      return;
    }

    if (audioFiles.length > 1) {
      toast({
        variant: "destructive",
        description: "Un seul fichier audio par annonce est autorisé.",
      });
      return;
    }

    startUpload(files);
  }

  function removeAttachment(customId: string) {
    setAttachments((prev) => prev.filter((a) => a.customId !== customId));
  }

  function removeAudio() {
    setAudioAttachment(null);
  }

  function reset() {
    setAttachments([]);
    setAudioAttachment(null);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    audioAttachment,
    isUploading,
    uploadProgress,
    removeAttachment,
    removeAudio,
    reset,
  };
}