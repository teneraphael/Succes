"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { Camera, Loader2, X, Tag, Banknote, ShoppingBag, Sparkles, ArrowRight, UserCog } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect, ClipboardEvent as ReactClipboardEvent } from "react";
import { useSubmitPostMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import "./styles.css";
import useMediaUpload from "./useMediaUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const router = useRouter();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [targetUserId, setTargetUserId] = useState("me");
  
  // ✅ Sécurité 1 : Initialisation forcée en tableau vide
  const [pioneers, setPioneers] = useState<{ id: string; displayName: string; username: string }[]>([]);
  const [isLoadingPioneers, setIsLoadingPioneers] = useState(false);

  const isAdmin = user?.username === "Tene" || user?.id === "4yq76ntw6lpduptd";

  useEffect(() => {
    if (isAdmin) {
      async function fetchPioneers() {
        setIsLoadingPioneers(true);
        try {
          const response = await fetch("/api/admin/pioneers");
          const data = await response.json();
          
          // ✅ Sécurité 2 : On ne met à jour que si c'est un tableau
          if (Array.isArray(data)) {
            setPioneers(data);
          } else {
            console.error("L'API n'a pas renvoyé un tableau :", data);
            setPioneers([]);
          }
        } catch (error) {
          console.error("Erreur réseau :", error);
          setPioneers([]);
        } finally {
          setIsLoadingPioneers(false);
        }
      }
      fetchPioneers();
    }
  }, [isAdmin]);

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

  const handlePaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      e.preventDefault();
      startUpload(files);
    }
  };

  const description = editor?.getText({ blockSeparator: "\n" }) || "";
  const isFormValid = productName.trim() !== "" && price.trim() !== "" && description.trim() !== "";

  if (!user?.isSeller && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] bg-muted/30 text-center gap-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <ShoppingBag className="size-10 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Devenez vendeur pour publier</h3>
          <p className="text-sm text-muted-foreground">Vous devez configurer votre boutique avant de mettre des articles en vente.</p>
        </div>
        <Button asChild className="rounded-xl font-bold">
          <Link href="/become-seller">
            Configurer ma boutique <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  function onSubmit() {
    if (!isFormValid) return;
    const formattedContent = `🛍️ PRODUIT : ${productName}\n💰 PRIX : ${price} FCFA\n\n📝 DESCRIPTION :\n${description}`;
    
    mutation.mutate(
      {
        content: formattedContent,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        targetUserId: isAdmin && targetUserId !== "me" ? targetUserId : undefined,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setProductName("");
          setPrice("");
          setTargetUserId("me");
          resetMediaUploads();
          toast({ 
            description: isAdmin && targetUserId !== "me" 
              ? "Annonce postée avec succès pour le vendeur !" 
              : "Annonce propulsée avec succès !" 
          });
          router.refresh();
        },
      },
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 p-1 transition-all", user?.isPioneer && "relative")}>
      
      {isAdmin && (
        <div className="bg-blue-600/5 border-2 border-blue-500/10 p-4 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-600">
              <UserCog className="size-4" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Gestion Curateur</span>
            </div>
            {targetUserId !== "me" && (
                <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
                    MODE SUBSTITUTION
                </div>
            )}
          </div>
          
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="h-11 rounded-xl bg-background border-blue-100 focus:ring-blue-500">
              <SelectValue placeholder="Choisir un vendeur" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="me" className="font-bold">✨ Poster en mon nom (Admin)</SelectItem>
              {/* ✅ Sécurité 3 : Vérification avant le map */}
              {Array.isArray(pioneers) && pioneers.map((pioneer) => (
                <SelectItem key={pioneer.id} value={pioneer.id}>
                  👤 {pioneer.displayName} (@{pioneer.username})
                </SelectItem>
              ))}
              {isLoadingPioneers && <div className="p-2 text-center text-xs text-muted-foreground italic">Chargement...</div>}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reste du formulaire inchangé pour la brièveté... */}
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

      <div 
        {...rootProps} 
        onPaste={handlePaste}
        className={cn(
          "relative rounded-[1.5rem] bg-muted/30 border border-transparent focus-within:border-primary/10 focus-within:bg-card transition-all",
          user?.isPioneer && targetUserId === "me" && "border-amber-400/20"
        )}
      >
        <div className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[160px] w-full px-6 py-4 prose prose-sm focus:outline-none",
              isDragActive && "opacity-30"
            )}
          />
          <input {...getInputProps()} />
        </div>
      </div>

      {!!attachments.length && (
        <div className="px-1">
          <AttachmentPreviews attachments={attachments} removeAttachment={removeAttachment} />
        </div>
      )}

      <div className="flex items-center justify-between p-2 rounded-[2rem] bg-muted/40 border border-border/40 backdrop-blur-sm">
        <AddAttachmentsButton onFilesSelected={startUpload} disabled={isUploading || attachments.length >= 10} />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!isFormValid || isUploading}
          className={cn(
            "h-12 px-8 rounded-[1.2rem] font-black uppercase italic",
            targetUserId !== "me" ? "bg-blue-600" : "bg-primary"
          )}
        >
          <Sparkles className="size-4 mr-2" />
          {targetUserId !== "me" ? "Substituer et Publier" : "Mettre en vente"}
        </LoadingButton>
      </div>
    </div>
  );
}

// Sous-composants inchangés...
function AddAttachmentsButton({ onFilesSelected, disabled }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full size-11 text-primary"
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
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
        <button onClick={onRemoveClick} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><X size={14} /></button>
      )}
    </div>
  );
}