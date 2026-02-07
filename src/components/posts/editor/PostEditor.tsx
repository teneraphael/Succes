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
import { Camera, Loader2, X, Tag, Banknote, ShoppingBag, Sparkles, ImageIcon } from "lucide-react";
import Image from "next/image";
import { ClipboardEvent, useRef, useState, useEffect } from "react";
import { useSubmitPostMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const router = useRouter();
  const { toast } = useToast();

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
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({
        placeholder: "Décrivez l'état, le stock ou les options de livraison...",
      }),
    ],
    immediatelyRender: false,
  });

  const description = editor?.getText({ blockSeparator: "\n" }) || "";
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
          toast({ description: "Annonce propulsée avec succès !" });
          router.push("/");
          router.refresh();
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
    <div className="flex flex-col gap-6">
      {/* SECTION INPUTS : NOM ET PRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Tag className="size-5" />
          </div>
          <Input
            placeholder="Nom de l'article"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="h-14 pl-12 rounded-[1.2rem] border-none bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-semibold"
          />
        </div>

        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#6ab344] transition-colors">
            <Banknote className="size-5" />
          </div>
          <Input
            placeholder="Prix"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-14 pl-12 pr-16 rounded-[1.2rem] border-none bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-semibold"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#6ab344] bg-[#6ab344]/10 px-2 py-1 rounded-md italic">
            FCFA
          </span>
        </div>
      </div>

      {/* ZONE DESCRIPTION */}
      <div className="relative rounded-[1.5rem] bg-muted/30 border border-transparent focus-within:border-primary/10 focus-within:bg-card transition-all">
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[160px] w-full px-6 py-4 prose prose-sm focus:outline-none",
              isDragActive && "opacity-30"
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
        
        {/* OVERLAY DRAG & DROP */}
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 backdrop-blur-[2px] rounded-[1.5rem] border-2 border-dashed border-primary/40 animate-in fade-in">
            <p className="text-sm font-black uppercase italic text-primary">Déposez les médias ici</p>
          </div>
        )}
      </div>

      {/* PRÉVIEWS DES ATTACHEMENTS */}
      {!!attachments.length && (
        <div className="px-1">
          <AttachmentPreviews attachments={attachments} removeAttachment={removeAttachment} />
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between p-2 rounded-[2rem] bg-muted/40 border border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <AddAttachmentsButton onFilesSelected={startUpload} disabled={isUploading || attachments.length >= 10} />
          {isUploading && (
            <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-primary/10">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span className="text-[10px] font-black text-primary">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!isFormValid || isUploading}
          className="h-12 px-8 rounded-[1.2rem] font-black uppercase italic tracking-tighter bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles className="size-4 mr-2" />
         Mettre en vente
        </LoadingButton>
      </div>

      {!isFormValid && (
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
          Remplissez tous les champs pour vendre
        </p>
      )}
    </div>
  );
}

function AddAttachmentsButton({ onFilesSelected, disabled }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full size-11 text-primary hover:bg-primary/10 transition-all"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera size={24} />
      </Button>
      <input type="file" accept="image/*,video/*" multiple ref={fileInputRef} className="hidden" onChange={(e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) onFilesSelected(files);
        e.target.value = "";
      }} />
    </>
  );
}

function AttachmentPreviews({ attachments, removeAttachment }: any) {
  return (
    <div className={cn("grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
      {attachments.map((attachment: any) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

function AttachmentPreview({ attachment: { file, isUploading }, onRemoveClick }: any) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className={cn("relative group overflow-hidden rounded-2xl border bg-muted/20", isUploading && "opacity-50")}>
      {file.type.startsWith("image") ? (
        <Image src={src} alt="Preview" width={200} height={200} className="aspect-square w-full object-cover" />
      ) : (
        <video className="aspect-square w-full object-cover bg-black"><source src={src} /></video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute top-2 right-2 p-1 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}