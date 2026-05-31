"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { 
  Camera, Loader2, X, Tag, Banknote, 
  Sparkles, Zap, SlidersHorizontal, Check, Type, Plus, Phone
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useSubmitPostMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import "./styles.css";
import useMediaUpload from "./useMediaUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicAttribute {
  name: string;
  values: string;
}

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const router = useRouter();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [phone, setPhone] = useState("");
  const [targetUserId, setTargetUserId] = useState("me");

  const [attributes, setAttributes] = useState<DynamicAttribute[]>([
    { name: "Couleur", values: "" }
  ]);

  const [pioneers, setPioneers] = useState<{ id: string; displayName: string; username: string }[]>([]);

  const isAdmin = !!user && (user.username === "dealcity" || user.id === "22lmc64bcqwsqybu");

  useEffect(() => {
    if (isAdmin) {
      async function fetchPioneers() {
        try {
          const response = await fetch("/api/admin/pioneers");
          const data = await response.json();
          setPioneers(Array.isArray(data) ? data : (data.pioneers || []));
        } catch (error) {
          console.error("Fetch Error:", error);
        }
      }
      fetchPioneers();
    }
  }, [isAdmin]);

  const {
    startUpload,
    attachments,
    isUploading,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
    disabled: isUploading,
  } as any);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({
        placeholder: "État, mode de livraison, détails additionnels...",
      }),
    ],
    immediatelyRender: false,
    // ✅ Intercepter le collage directement dans les options de l'éditeur
    editorProps: {
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        // Si pas de saut de ligne, comportement normal de Tiptap
        if (!text || !text.includes("\n")) return false;

        event.preventDefault();

        const lines = text.split("\n");
        const { state, dispatch } = view;
        const { schema, tr, selection } = state;

        // Supprimer la sélection courante
        let transaction = tr.deleteSelection();
        let pos = transaction.selection.from;

        lines.forEach((line, index) => {
          if (index > 0) {
            // Créer un nouveau paragraphe pour chaque saut de ligne
            const node = schema.nodes.paragraph.createAndFill();
            if (node) {
              transaction = transaction.insert(pos, node);
              pos += node.nodeSize;
            }
          }
          if (line.trim().length > 0) {
            const textNode = schema.text(line);
            transaction = transaction.insert(pos, textNode);
            pos += textNode.nodeSize;
          }
        });

        dispatch(transaction.scrollIntoView());
        return true;
      },
    },
  });

  // ✅ Récupère le texte avec \n entre chaque paragraphe
  const description = editor?.getText({ blockSeparator: "\n" }) || "";

  const isFormValid =
    productName.trim() !== "" &&
    price.trim() !== "" &&
    stock.trim() !== "" &&
    parseInt(stock) >= 0;

  const addAttributeAxis = () => {
    setAttributes([...attributes, { name: "", values: "" }]);
  };

  const removeAttributeAxis = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, key: "name" | "values", value: string) => {
    const updated = [...attributes];
    updated[index][key] = value;
    setAttributes(updated);
  };

  function onSubmit() {
    if (!isFormValid) return;

    const formattedAttributes = attributes
      .filter(attr => attr.name.trim() !== "" && attr.values.trim() !== "")
      .map(attr => ({
        name: attr.name.trim(),
        values: attr.values.split(",").map(v => v.trim()).filter(v => v !== "")
      }));

    let attributesText = "";
    formattedAttributes.forEach(attr => {
      attributesText += `\n⚙️ ${attr.name.toUpperCase()}S : ${attr.values.join(", ")}`;
    });

    const stockInfo = `\n📦 QUANTITÉ GLOBALE : ${stock}`;
    const whatsappInfo = phone ? `\n📞 WHATSAPP : ${phone}` : "";

    mutation.mutate(
      {
        content: `🛍️ PRODUIT : ${productName}\n💰 PRIX : ${price} FCFA${attributesText}${stockInfo}${whatsappInfo}\n\n📝 DESCRIPTION :\n${description}`,
        mediaIds: attachments.map((a: any) => a.mediaId).filter(Boolean) as string[],
        stock: parseInt(stock),
        targetUserId: isAdmin && targetUserId !== "me" ? targetUserId : undefined,
        attributes: formattedAttributes,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setProductName("");
          setPrice("");
          setPhone("");
          setAttributes([{ name: "Couleur", values: "" }]);
          setStock("1");
          setTargetUserId("me");
          resetMediaUploads();
          toast({ description: "Produit publié avec ses variantes dynamiques !" });
          router.refresh();
        },
      },
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 bg-card p-6 rounded-2xl border shadow-xs transition-colors">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <Zap className="size-4 text-[#00b272]" />
          </div>
          <div>
            <h2
              className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic"
              style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
            >
              Studio de Vente
            </h2>
          </div>
        </div>

        {isAdmin && (
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="h-9 w-[180px] rounded-full bg-muted border-none text-[10px] font-black uppercase outline-none focus:ring-0 italic text-slate-700 dark:text-zinc-300">
              <SelectValue placeholder="Substitution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me" className="text-xs font-bold uppercase italic">✨ Mon Profil</SelectItem>
              {pioneers.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase italic">
                  👤 {p.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Champs principaux ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full h-12 pl-12 rounded-xl bg-muted/50 border border-transparent focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-background outline-none transition-all text-sm font-extrabold uppercase tracking-tight text-slate-900 dark:text-white"
            style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
          />
        </div>

        <div className="relative">
          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            placeholder="Prix (FCFA)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-12 pl-12 rounded-xl bg-muted/50 border border-transparent focus:border-[#00b272]/30 focus:bg-background outline-none transition-all text-sm font-black text-[#00b272]"
            style={{ fontFamily: "'Geist Mono', 'Courier New', monospace" }}
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            placeholder="Numéro WhatsApp"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 pl-12 rounded-xl bg-muted/50 border border-transparent focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-background outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
          />
        </div>
      </div>

      {/* ── Éditeur de description ── */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl bg-muted/30 border-2 border-dashed border-transparent transition-all",
          isDragActive && "border-emerald-500/30 bg-emerald-500/5"
        )}
      >
        <EditorContent
          editor={editor}
          className="min-h-[120px] w-full px-4 py-3 prose dark:prose-invert max-w-none text-sm focus:outline-none text-slate-800 dark:text-zinc-200"
          style={{ fontFamily: "'Geist', 'Inter', sans-serif", fontWeight: 500 }}
        />
        <input {...getInputProps()} />
      </div>

      {/* ── Aperçu des pièces jointes ── */}
      {!!attachments.length && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {attachments.map((attachment: any) => (
            <AttachmentStudio
              key={attachment.file.name}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.file.name)}
            />
          ))}
        </div>
      )}

      {/* ── Barre du bas ── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <AddAttachmentsButton
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 10}
          />
        </div>

        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!isFormValid || isUploading}
          className="rounded-xl px-6 font-black text-xs uppercase italic tracking-widest bg-[#00b272] hover:bg-[#009a62] text-white shadow-md shadow-emerald-500/10 transition-all h-11"
          style={{ fontFamily: "'Geist', 'Inter', sans-serif" } as any}
        >
          <Sparkles className="size-3.5 mr-1.5" />
          Publier le Produit
        </LoadingButton>
      </div>
    </div>
  );
}

function AttachmentStudio({ attachment, onRemove }: any) {
  const [src, setSrc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    videoStart: 0,
    videoEnd: 10,
    overlayText: "",
  });

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [attachment.file]);

  const isVideo = attachment.file.type.startsWith("video");

  const filterStyle = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturate}%)`
  };

  useEffect(() => {
    if (isVideo && videoRef.current) {
      const v = videoRef.current;
      const handleTimeUpdate = () => {
        if (v.currentTime >= settings.videoEnd) {
          v.currentTime = settings.videoStart;
        }
      };
      v.addEventListener("timeupdate", handleTimeUpdate);
      return () => v.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [isVideo, settings.videoStart, settings.videoEnd]);

  return (
    <div className="flex flex-col gap-2">
      <div className={cn(
        "relative group rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-900 bg-black aspect-[3/4] shadow-xs transition-all",
        attachment.isUploading && "opacity-50"
      )}>
        {attachment.file.type.startsWith("image") ? (
          <img src={src} style={filterStyle} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <video
            ref={videoRef}
            src={src}
            style={filterStyle}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            onLoadedMetadata={(e) => {
              const d = Math.floor(e.currentTarget.duration);
              setDuration(d);
              setSettings(prev => ({ ...prev, videoEnd: d }));
            }}
          />
        )}

        {settings.overlayText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
            <span
              className="bg-black/70 backdrop-blur-xs px-3 py-1 text-white font-black uppercase text-xs border-2 border-white tracking-wide italic"
              style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
            >
              {settings.overlayText}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
            className="p-2.5 bg-white text-black rounded-full hover:scale-110 transition shadow-lg"
          >
            {isEditing ? <Check size={16} /> : <SlidersHorizontal size={16} />}
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 transition shadow-lg"
          >
            <X size={16} />
          </button>
        </div>

        {attachment.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-[#00b272]" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-4 border border-slate-100 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 italic">
              <Type size={10} /> Texte publicitaire
            </div>
            <input
              type="text"
              placeholder="TEXTE..."
              value={settings.overlayText}
              onChange={(e) => setSettings({ ...settings, overlayText: e.target.value.toUpperCase() })}
              className="w-full bg-background border border-slate-100 dark:border-zinc-800 rounded-lg p-2 text-[10px] font-bold outline-none text-slate-900 dark:text-white"
              style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
            />
          </div>

          {isVideo && (
            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-2">
              <div className="text-[9px] font-black uppercase text-[#00b272] italic">Découper la séquence</div>
              <input
                type="range" min="0" max={duration} value={settings.videoStart}
                onChange={(e) => setSettings({ ...settings, videoStart: parseInt(e.target.value) })}
                className="w-full h-1 accent-[#00b272]"
              />
              <input
                type="range" min="1" max={duration} value={settings.videoEnd}
                onChange={(e) => setSettings({ ...settings, videoEnd: parseInt(e.target.value) })}
                className="w-full h-1 accent-[#00b272]"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 dark:border-zinc-800 pt-2">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 italic">Luminosité</span>
              <input
                type="range" min="50" max="150" value={settings.brightness}
                onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
                className="w-full h-1 bg-emerald-500/10 rounded-full appearance-none accent-[#00b272]"
              />
            </div>
          </div>
        </div>
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
        className="rounded-full text-slate-400 hover:text-[#00b272] hover:bg-emerald-500/5 transition-colors"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera size={20} />
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
      />
    </>
  );
}