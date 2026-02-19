"use client";

import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  
  // ✨ État dédié pour l'audio unique de l'annonce
  const [audioAttachment, setAudioAttachment] = useState<Attachment | null>(null);

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        const prefix = file.type.startsWith("audio") ? "audio" : "attachment";
        return new File(
          [file],
          `${prefix}_${uuidv4()}.${extension}`,
          { type: file.type }
        );
      });

      // On sépare l'audio des autres médias dans l'UI
      const newAttachments = renamedFiles
        .filter(f => !f.type.startsWith("audio"))
        .map(file => ({ file, isUploading: true }));
      
      const newAudio = renamedFiles
        .filter(f => f.type.startsWith("audio"))
        .map(file => ({ file, isUploading: true }))[0];

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
      // 1. Mise à jour des images/vidéos
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadResult = res.find((r) => r.name === a.file.name);
          if (!uploadResult) return a;
          return {
            ...a,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        })
      );

      // 2. Mise à jour de l'audio si présent
      setAudioAttachment((prev) => {
        if (!prev) return null;
        const uploadResult = res.find((r) => r.name === prev.file.name);
        if (!uploadResult) return prev;
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

    // Séparer les types
    const audioFiles = files.filter(f => f.type.startsWith("audio"));
    const mediaFiles = files.filter(f => !f.type.startsWith("audio"));

    // Validation limite médias (10)
    if (attachments.length + mediaFiles.length > 10) {
      toast({
        variant: "destructive",
        description: "Maximum 10 photos/vidéos par annonce.",
      });
      return;
    }

    // Validation audio unique
    if (audioFiles.length > 1) {
      toast({
        variant: "destructive",
        description: "Un seul fichier audio par annonce est autorisé.",
      });
      return;
    }

    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
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
    audioAttachment, // ✨ Retourne l'audio séparément
    isUploading,
    uploadProgress,
    removeAttachment,
    removeAudio,
    reset,
  };
}