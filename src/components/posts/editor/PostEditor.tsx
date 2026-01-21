"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { Camera, Loader2, X, Tag, Banknote, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { ClipboardEvent, useRef, useState } from "react";
import { useSubmitPostMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Détails de l'offre (état, stock, livraison...)",
      }),
    ],
    immediatelyRender: false,
  });

  const description = editor?.getText({
    blockSeparator: "\n",
  }) || "";

  const isFormValid = productName.trim() !== "" && price.trim() !== "" && description.trim() !== "";

  function onSubmit() {
    if (!isFormValid) return;

    const formattedContent = `🛍️ PRODUIT : ${productName}\n💰 PRIX : ${price} FCFA\n\n📝 DESCRIPTION :\n${description}`;
    
    mutation.mutate(
      {
        content: formattedContent,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setProductName("");
          setPrice("");
          resetMediaUploads();
        },
      },
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm border-2 border-[#4a90e2]/10">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <ShoppingBag className="size-5 text-[#6ab344]" />
        <h3 className="font-bold text-[#4a90e2] text-sm uppercase tracking-wider">Créer une annonce</h3>
      </div>

      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="flex w-full flex-col gap-4">
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nom de l'article"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-background pl-10 border-none ring-1 ring-primary/20 focus-visible:ring-[#4a90e2]"
              />
            </div>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Prix"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background pl-10 pr-16 border-none ring-1 ring-primary/20 focus-visible:ring-[#4a90e2]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6ab344]">
                FCFA
              </span>
            </div>
          </div>

          <div {...rootProps} className="w-full">
            <EditorContent
              editor={editor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3 ring-1 ring-primary/10",
                isDragActive && "outline-dashed outline-[#4a90e2]",
              )}
              onPaste={onPaste}
            />
            <input {...getInputProps()} />
          </div>
        </div>
      </div>

      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <div className="flex items-center gap-3">
          <AddAttachmentsButton
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
          {isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{uploadProgress ?? 0}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isFormValid && (
            <span className="hidden text-[11px] font-medium text-destructive/80 sm:inline">
              Veuillez remplir tous les champs
            </span>
          )}
          <LoadingButton
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={!isFormValid || isUploading}
            className="min-w-32 rounded-full font-bold bg-[#6ab344] hover:bg-[#5a9c39] text-white"
          >
            Mettre en vente
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({ onFilesSelected, disabled }: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_SIZE_MB = 50; 
    const MAX_VIDEO_DURATION = 60; 

    const validatedFiles: File[] = [];

    files.forEach((file) => {
      // 1. Vérification de la taille
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_SIZE_MB) {
        alert(`Le fichier ${file.name} est trop lourd (max ${MAX_SIZE_MB}Mo).`);
        return;
      }

      // 2. Vérification de la durée pour les vidéos
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            alert(`La vidéo ${file.name} est trop longue (max ${MAX_VIDEO_DURATION}s).`);
          } else {
            onFilesSelected([file]);
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        validatedFiles.push(file);
      }
    });

    if (validatedFiles.length) {
      onFilesSelected(validatedFiles);
    }

    e.target.value = ""; 
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:bg-primary/10 transition-transform active:scale-90"
        disabled={disabled}
        title="Prendre une photo/vidéo ou choisir un fichier"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera size={26} />
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({ attachments, removeAttachment }: AttachmentPreviewsProps) {
  return (
    <div className={cn("flex flex-col gap-3", attachments.length > 1 && "sm:grid sm:grid-cols-2")}>
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({ attachment: { file, isUploading }, onRemoveClick }: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}>
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Preview"
          width={500}
          height={500}
          className="size-fit max-h-[25rem] rounded-2xl object-cover"
        />
      ) : (
        <video controls className="size-fit max-h-[25rem] rounded-2xl shadow-lg">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground/80 p-1.5 text-background backdrop-blur-sm transition-colors hover:bg-foreground"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}