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
  Sparkles, Music, Zap, Play, Pause, Scissors, SlidersHorizontal, Check, Type
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useSubmitPostMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
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
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const [pioneers, setPioneers] = useState<{ id: string; displayName: string; username: string }[]>([]);

  const isAdmin = !!user && (user.username === "Tene" || user.id === "4yq76ntw6lpduptd");

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
    audioAttachment,
    isUploading,
    removeAttachment,
    removeAudio,
    reset: resetMediaUploads,
  } = useMediaUpload();

const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
    disabled: isUploading,
  } as any); // Le "as any" ici règle le conflit de type sans impacter le reste du code
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({
        placeholder: "État, stock, mode de livraison...",
      }),
    ],
    immediatelyRender: false,
  });

  const description = editor?.getText({ blockSeparator: "\n" }) || "";
  const isFormValid = productName.trim() !== "" && price.trim() !== "";

  function onSubmit() {
    if (!isFormValid) return;

    const audioInfo = audioTitle ? `\n\n🎵 TRACK : ${audioTitle}${audioArtist ? ` - ${audioArtist}` : ""}` : "";

    mutation.mutate(
      {
        content: `🛍️ PRODUIT : ${productName}\n💰 PRIX : ${price} FCFA\n\n📝 DESCRIPTION :\n${description}${audioInfo}`,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        audioId: audioAttachment?.mediaId,
        targetUserId: isAdmin && targetUserId !== "me" ? targetUserId : undefined,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setProductName("");
          setPrice("");
          setAudioTitle("");
          setAudioArtist("");
          setTargetUserId("me");
          resetMediaUploads();
          toast({ description: "Publication réussie !" });
          router.refresh();
        },
      },
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 bg-card p-6 rounded-2xl border shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
               <Zap className="size-4 text-primary" />
            </div>
            <div>
               <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Studio de Vente</h2>
               <p className="text-[10px] font-medium text-primary uppercase">Production Mode</p>
            </div>
        </div>

        {isAdmin && (
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="h-9 w-[180px] rounded-full bg-muted border-none text-[10px] font-bold uppercase outline-none focus:ring-0">
              <SelectValue placeholder="Substitution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me">✨ Mon Profil</SelectItem>
              {pioneers.map((p) => (
                <SelectItem key={p.id} value={p.id}>👤 {p.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* INPUTS PRODUIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="NOM DU PRODUIT"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full h-12 pl-12 rounded-xl bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-background outline-none transition-all text-sm font-bold uppercase"
          />
        </div>

        <div className="relative">
          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="PRIX (FCFA)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-12 pl-12 rounded-xl bg-muted/50 border border-transparent focus:border-green-500/30 focus:bg-background outline-none transition-all text-sm font-mono font-bold text-green-600"
          />
        </div>
      </div>

      {/* TEXT EDITOR / DROPZONE */}
      <div {...getRootProps()} className={cn("relative rounded-xl bg-muted/30 border-2 border-dashed border-transparent transition-all", isDragActive && "border-primary/50 bg-primary/5")}>
        <EditorContent editor={editor} className="min-h-[120px] w-full px-4 py-3 prose dark:prose-invert max-w-none text-sm focus:outline-none" />
        <input {...getInputProps()} />
      </div>

      {/* AUDIO EDITOR */}
      {audioAttachment && (
        <AudioStudioEditor 
          file={audioAttachment.file} 
          isUploading={audioAttachment.isUploading}
          onRemove={removeAudio}
          title={audioTitle}
          setTitle={setAudioTitle}
          artist={audioArtist}
          setArtist={setAudioArtist}
        />
      )}

      {/* MEDIA GRID */}
      {!!attachments.length && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {attachments.map((attachment) => (
            <AttachmentStudio 
              key={attachment.file.name} 
              attachment={attachment} 
              onRemove={() => removeAttachment(attachment.file.name)} 
            />
          ))}
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <AddAttachmentsButton onFilesSelected={startUpload} disabled={isUploading || attachments.length >= 10} />
          
          <label className={cn(
            "cursor-pointer p-2.5 rounded-full transition-all", 
            audioAttachment ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted"
          )}>
            <Music size={20} />
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) startUpload(files);
              }} 
            />
          </label>
        </div>

        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!isFormValid || isUploading}
          className="rounded-full px-8 font-bold"
        >
          <Sparkles className="size-4 mr-2" />
          Publier le Produit
        </LoadingButton>
      </div>
    </div>
  );
}

// --- COMPOSANT : STUDIO AUDIO ---
function AudioStudioEditor({ file, onRemove, title, setTitle, artist, setArtist }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [regionRange, setRegionRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#94a3b8",
      progressColor: "#3b82f6",
      cursorColor: "#3b82f6",
      barWidth: 2,
      barRadius: 3,
      height: 70,
      normalize: true,
      minPxPerSec: 40,
    });

    const wsRegions = ws.registerPlugin(RegionsPlugin.create());
    ws.loadBlob(file);
    waveSurferRef.current = ws;

    ws.on("ready", () => {
      const duration = ws.getDuration();
      const end = duration > 30 ? 30 : duration;
      wsRegions.addRegion({
        start: 0,
        end: end,
        color: "rgba(59, 130, 246, 0.2)",
        drag: true,
        resize: true,
      });
      setRegionRange({ start: 0, end: end });
    });

    wsRegions.on("region-updated", (region) => {
      setRegionRange({ start: region.start, end: region.end });
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    return () => ws.destroy();
  }, [file]);

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => waveSurferRef.current?.playPause()}
            className="size-10 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 transition shadow-lg"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
               <h4 className="text-[10px] font-black uppercase tracking-tighter text-primary">Audio Trimmer</h4>
               <Scissors className="size-3 text-muted-foreground" />
            </div>
            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">{file.name}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold font-mono text-primary">
             {regionRange.start.toFixed(1)}s - {regionRange.end.toFixed(1)}s
           </span>
           <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div ref={containerRef} className="bg-muted/30 rounded-lg p-2 overflow-hidden" />
        <div className="grid grid-cols-2 gap-3">
          <input 
            placeholder="Titre de l'audio" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="bg-muted/50 border border-transparent focus:border-primary/20 rounded-xl px-3 py-2 text-xs outline-none"
          />
          <input 
            placeholder="Artiste / Marque" 
            value={artist} 
            onChange={e => setArtist(e.target.value)}
            className="bg-muted/50 border border-transparent focus:border-primary/20 rounded-xl px-3 py-2 text-xs outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// --- ATTACHMENT STUDIO ---
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
        "relative group rounded-2xl overflow-hidden border bg-black aspect-[3/4] shadow-sm transition-all",
        attachment.isUploading && "opacity-50"
      )}>
        {attachment.file.type.startsWith("image") ? (
          // eslint-disable-next-line @next/next/no-img-element
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
            <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-white font-black uppercase text-sm border-2 border-white">
              {settings.overlayText}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
            className="p-3 bg-white text-black rounded-full hover:scale-110 transition shadow-xl"
          >
            {isEditing ? <Check size={18} /> : <SlidersHorizontal size={18} />}
          </button>
          
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition shadow-xl"
          >
            <X size={18} />
          </button>
        </div>

        {attachment.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-primary" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-3 bg-muted/80 rounded-xl space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase opacity-60">
              <Type size={10} /> Texte
            </div>
            <input 
              type="text" 
              placeholder="TEXTE..."
              value={settings.overlayText}
              onChange={(e) => setSettings({...settings, overlayText: e.target.value.toUpperCase()})}
              className="w-full bg-background border-none rounded-lg p-2 text-[10px] font-bold outline-none"
            />
          </div>

          {isVideo && (
            <div className="space-y-2 border-t pt-2">
              <div className="text-[9px] font-black uppercase text-primary">Découpe</div>
              <input 
                type="range" min="0" max={duration} value={settings.videoStart}
                onChange={(e) => setSettings({...settings, videoStart: parseInt(e.target.value)})}
                className="w-full h-1 accent-primary"
              />
              <input 
                type="range" min="1" max={duration} value={settings.videoEnd}
                onChange={(e) => setSettings({...settings, videoEnd: parseInt(e.target.value)})}
                className="w-full h-1 accent-primary"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 border-t pt-2">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase opacity-60">Luminosité</span>
              <input 
                type="range" min="50" max="150" value={settings.brightness}
                onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})}
                className="w-full h-1 bg-primary/20 rounded-full appearance-none accent-white"
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
        className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" 
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