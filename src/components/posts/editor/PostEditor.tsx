"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import {
  Camera, Loader2, X,
  Tag, Banknote, Sparkles, Zap,
  SlidersHorizontal, Check, Type, Phone, MapPin, Building2, Sliders,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useSubmitPostMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import "./styles.css";
import useMediaUpload from "./useMediaUpload";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageProvider";

// ✅ Liste officielle et complète des villes et quartiers du Cameroun
const CITIES_WITH_QUARTERS: Record<string, string[]> = {
  "Douala": [
    "Akwa", "Akwa Nord", "Akwa Sud", "Bonanjo", "Bonapriso", "Bali",
    "Deïdo", "Ndokotti", "New-Bell", "New-Deïdo", "Makepe", "Makepe Missoke",
    "Logbessou", "Logpom", "Kotto", "Bonabéri", "Bonamoussadi", "Bonamoussadi Village",
    "Bassa", "Bassa Industriel", "Ndog-Bong", "Ndog-Passi", "Nkongmondo",
    "PK 8", "PK 10", "PK 11", "PK 12", "PK 13", "PK 14", "PK 17", "PK 19",
    "Nyalla", "Nyalla Village", "Kake", "Sodiko", "Cité des Palmiers",
    "Cité SIC", "Cité Oyack", "Village", "Ndoghem", "Mboppi",
    "Ange Raphael", "Congo", "Bessengue", "Mbanya", "Nkouloulou",
    "Oyack", "Mabanda", "Mboko", "Ndibe", "Ndogbea", "Nkomba",
    "Bepanda", "Bepanda Omnisport", "Bepanda libre", "Ndog-Simple",
    "Cité CICAM", "Cité SONEL", "Ndogsimbi", "Ngodi Bakoko",
    "Ngodi sur Wouri", "Bilongue", "Ndokoti", "Marché Congo",
    "Njo-Njo", "Essengue", "Bonapriso extension", "Bilingue",
    "Maképé Maturité", "Cité SIC Bassa", "Cité Sic Makepe", "Sable", "Yassa", "Ancien Dalip", "Besseke", "Grand Hangar"
  ],
  "Yaoundé": [
    "Centre-ville", "Bastos", "Nlongkak", "Mvan", "Biyem-Assi",
    "Essos", "Mendong", "Ngousso", "Nkolbisson", "Etoudi",
    "Mfandena", "Omnisport", "Messa", "Nkomo", "Nkol-Eton",
    "Kondengui", "Madagascar", "Briqueterie", "Mokolo", "Mvog-Ada",
    "Mvog-Mbi", "Mvog-Beti", "Mvog-Atangana-Mballa", "Obili",
    "Ngoa-Ekelle", "Nkolndongo", "Nkol-Afeme", "Elig-Effa",
    "Elig-Essono", "Elig-Edzoa", "Elig-Mfomo", "Ekounou",
    "Emana", "Ahala", "Soa", "Nkolbison", "Titi",
    "Oyom-Abang", "Olembe", "Nkoldongo", "Etam-Bafia",
    "Odza", "Mimboman", "Cité Verte", "Ntougou", "Nsam",
    "Ngousso Nord", "Ngousso Sud", "Mfou", "Simbock",
    "Nkolafamba", "Tsinga", "Quartier du Lac", "Fébé", "Mbala", "Nkolmesseng",
    "Damas", "Fouda", "Nkomo Village", "Nkoabang", "Nsimeyong", "Obobogo", "Messassi", "Nkomkana"
  ],
  "Bafoussam": [
    "Centre", "Tamdja", "Djeleng", "Kamkop", "Ngouache",
    "Banengo", "Famla", "Tougang", "Plateau", "Lelem",
    "Wenfou", "Koptchou", "Djeleng Nord", "Djeleng Sud",
    "Nylon", "Nattrakom", "Kwa-Kwa", "Nkou'ou", "Bangoua",
    "Fomkap", "Bamendou", "Nkouoptamo", "Tyo-Ville",
    "Kamkop Village", "Kouokoue", "Koupa", "Ngoumou", "Nietche", "Batoufam", "Kouogouo", "Hiala"
  ],
  "Buea": [
    "Molyko", "Great Soppo", "Bonduma", "Mile 16", "Mile 17",
    "Bomaka", "Bokwango", "Buea Town", "Buea Road", "Clerks Quarter",
    "GRA", "Sandpit", "Tole", "Wonyangong", "Muea",
    "Likoko", "Membea", "Lysoka", "Bokova", "Bova",
    "Ewonda", "Muyuka", "Kake", "Sasse", "Wonikang", "Bongo Square", "Small Soppo", "Check Point"
  ],
  "Kribi": [
    "Centre", "Talla", "Mbaa", "Grand Batanga", "Petit Batanga",
    "Mpalla", "Lolabé", "Londji", "Nziou", "Bibamba",
    "Mpolongwe", "Quartier Belle Vue", "Quartier Commerce",
    "Camping", "Nouvelle Route", "Akom II", "Mboa Manga", "Mpang", "Ngoye", "Ocean", "Mbadji", "Dombe", "Bousouma", "Mbeka'a"
  ],
  "Limbe": [
    "Down Beach", "Mile 4", "Clerks Quarter", "Bota",
    "New Town", "Cassava Farm", "GRA", "Church Street",
    "Mabeta", "Motowo", "Half Mile", "Congo Town",
    "Mbende", "Sanje", "Idenau", "Mokundange", "Middle Farm", "Unity Quarters"
  ],
  "Garoua": [
    "Centre", "Lopéré", "Plateau", "Marouaré", "Poumpoumré",
    "Souaré", "Djamboutou", "Bagaladji", "Bocklé",
    "Roumdé Adjia", "Foulbéré", "Dougoy", "Ngong",
    "Bibémi", "Mayo Hourna", "Yelwa", "Caldou", "Djarengol", "Base", "Ouro-Laddeo"
  ],
  "Maroua": [
    "Centre", "Dougoy", "Palar", "Kakataré", "Louggéré",
    "Domayo", "Zokok", "Dougoï", "Bonguel", "Roudouré",
    "Hardé", "Founangué", "Makabaye", "Kodek", "Papata",
    "Pitoa", "Balaza", "Dogba", "Pitoare", "Foumban Road", "Hardjo", "Abattoir", "Drogue", "Doualaré"
  ],
  "Ngaoundéré": [
    "Centre", "Dang", "Mbideng", "Gadamabanga", "Baladji",
    "Jareng", "Boulkitou", "Madiré", "Ngaoundaba", "Martap",
    "Tibati", "Dibi", "Béka", "Sabongari", "Ribeirao"
  ],
  "Bamenda": [
    "Commercial Avenue", "Up Station", "Old Town", "Nkwen",
    "Ntarikon", "Cowbell", "Hospital Area", "Food Market",
    "Mbatu", "Mulang", "Barrack", "Mile 4 Nkwen",
    "Mankon", "Azire", "Pinyin", "Bambui", "Bambili",
    "Bali", "Santa", "Bafut", "Mile 3", "Mile 2", "New Town", "Nitop", "Abangoh"
  ],
  "Bertoua": [
    "Centre", "Nkolbikon", "Haoussa", "Mboukou", "Mokolo",
    "Cité des Sapeurs", "Cité Meiganga", "Mindourou",
    "Doumé", "Abong-Mbang", "Lomié", "Enia", "Bongandé", "Kpokolota"
  ],
  "Ebolowa": [
    "Centre", "Angalé", "Nkoltang", "Nkol-Nnam", "Mengong",
    "Mvangan", "Ambam", "Ma'an", "Meyo-Centre", "Efoulan", "Nko'ovos", "Akak", "Meimbang", "Ebolowa II"
  ],
  "Edéa": [
    "Centre", "Port", "Cité ALUCAM", "Pont-Rail", "Borne 5",
    "Ndog-Bong", "Malimba", "Mouanko", "Dizangué"
  ],
  "Kumba": [
    "Mile 1", "Mile 2", "Mile 3", "Mile 4", "Mile 6",
    "Buea Road", "Fiango", "Mbeng", "Kake",
    "Tiko Road", "Komb", "Mundemba"
  ],
  "Nkongsamba": [
    "Centre", "Bamendjou", "Melong", "Manjo", "Loum",
    "Mbanga", "Njoré", "Bakaka", "Tombel"
  ],
  "Sangmélima": [
    "Centre", "Biba", "Djoum", "Oveng", "Bengbis",
    "Meyomessala", "Zoétélé"
  ],
  "Foumban": [
    "Centre", "Njimom", "Koutaba", "Magba", "Malantouen",
    "Bangourain", "Mvoutte", "Njinka", "Mpepouo", "Aéroport", "Palais"
  ],
  "Dschang": [
    "Centre", "Foto", "Fongo-Tongo", "Santchou", "Kékem",
    "Bafou", "Penka-Michel"
  ],
  "Mbouda": [
    "Centre", "Batcham", "Babadjou", "Bafang", "Bandja",
    "Galim", "Batié"
  ],
  "Tibati": [
    "Centre", "Ngaoundal", "Mbakaou", "Wouldé"
  ],
  "Batouri": [
    "Centre", "Kentzou", "Ndélélé", "Yokadouma",
    "Moloundou", "Nola"
  ],
};

export default function PostEditor() {
  const { user } = useSession();
  const { t } = useLanguage();
  const mutation = useSubmitPostMutation();
  const router = useRouter();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("Prix taxer / Discutable");
  const [stock, setStock] = useState("1");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [targetUserId, setTargetUserId] = useState("me");
  const [pioneers, setPioneers] = useState<{ id: string; displayName: string; username: string }[]>([]);

  const isAdmin = !!user && (user.username === "dealcity" || user.id === "22lmc64bcqwsqybu");

  const availableNeighborhoods = CITIES_WITH_QUARTERS[city as keyof typeof CITIES_WITH_QUARTERS] || [];

  useEffect(() => {
    setNeighborhood("");
  }, [city]);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/pioneers")
        .then((r) => r.json())
        .then((data) => setPioneers(Array.isArray(data) ? data : (data.pioneers || [])))
        .catch(console.error);
    }
  }, [isAdmin]);

  const { startUpload, attachments, isUploading, removeAttachment, reset: resetMediaUploads } = useMediaUpload();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
    disabled: isUploading,
  } as any);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({ placeholder: t.description_placeholder }),
    ],
    immediatelyRender: false,
    editorProps: {
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (!text || !text.includes("\n")) return false;
        event.preventDefault();
        const lines = text.split("\n");
        const { state, dispatch } = view;
        const { schema, tr } = state;
        let transaction = tr.deleteSelection();
        let pos = transaction.selection.from;
        lines.forEach((line, index) => {
          if (index > 0) {
            const node = schema.nodes.paragraph.createAndFill();
            if (node) { transaction = transaction.insert(pos, node); pos += node.nodeSize; }
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

  const description = editor?.getText({ blockSeparator: "\n" }) || "";

  // ✅ Validation : Tout est obligatoire SAUF la description, mais au moins 1 fichier est obligatoire
  const isFormValid =
    productName.trim() !== "" &&
    price.trim() !== "" &&
    priceType.trim() !== "" &&
    stock.trim() !== "" &&
    parseInt(stock) >= 0 &&
    phone.trim() !== "" &&
    city.trim() !== "" &&
    neighborhood.trim() !== "" &&
    attachments.length > 0; // Description retirée de la condition

  function onSubmit() {
    if (!isFormValid) return;

    const formattedCity = city.trim();
    const formattedNeighborhood = neighborhood.trim();

    const stockInfo = `\n QUANTITÉ GLOBALE : ${stock}`;
    const whatsappInfo = phone ? `\n WHATSAPP : ${phone}` : "";
    const locationInfo = `\n LOCALISATION : ${formattedNeighborhood}, ${formattedCity}`;
    const descriptionInfo = description.trim() !== "" ? `\n\n DESCRIPTION :\n${description}` : "";

    mutation.mutate(
      {
        content: ` PRODUIT : ${productName}\n PRIX : ${price} FCFA (${priceType})${stockInfo}${whatsappInfo}${locationInfo}${descriptionInfo}`,
        mediaIds: attachments.map((a: any) => a.mediaId).filter(Boolean) as string[],
        stock: parseInt(stock),
        city: formattedCity,
        neighborhood: formattedNeighborhood,
        targetUserId: isAdmin && targetUserId !== "me" ? targetUserId : undefined,
        attributes: [],
      } as any,
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setProductName("");
          setPrice("");
          setPriceType("Prix taxer / Discutable");
          setPhone("");
          setStock("1");
          setCity("");
          setNeighborhood("");
          setTargetUserId("me");
          resetMediaUploads();
          toast({ description: t.product_published });
          router.refresh();
        },
      },
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
            <Zap className="size-4 text-[#4a90e2]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t.seller_studio}
            </p>
            <p className="text-[9px] text-muted-foreground/60 font-medium">DealCity</p>
          </div>
        </div>

        {isAdmin && (
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="h-9 w-[180px] rounded-2xl bg-muted border-none text-[10px] font-black uppercase outline-none focus:ring-0 italic">
              <SelectValue placeholder="Substitution" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="me" className="text-xs font-bold uppercase italic">
                ✨ Mon Profil
              </SelectItem>
              {pioneers.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs font-bold uppercase italic">
                  👤 {p.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder={t.product_name}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full h-12 pl-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 focus:border-[#4a90e2]/30 focus:ring-2 focus:ring-[#4a90e2]/8 outline-none transition-all text-sm font-black uppercase tracking-tight"
          />
        </div>

        <div className="relative">
          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder={t.price}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-12 pl-12 rounded-2xl bg-[#f8fff8] dark:bg-zinc-800/50 border border-[#6ab344]/10 focus:border-[#6ab344]/30 focus:ring-2 focus:ring-[#6ab344]/8 outline-none transition-all text-sm font-black text-[#6ab344]"
          />
        </div>

        <div className="relative">
          <Select value={priceType} onValueChange={setPriceType}>
            <SelectTrigger className="w-full h-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 px-4 text-xs font-black uppercase">
              <div className="flex items-center gap-2 truncate">
                <Sliders className="size-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Type de prix" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="Prix taxer / Discutable" className="text-xs font-black uppercase">
                Prix taxer / Discutable
              </SelectItem>
              <SelectItem value="Légèrement discutable" className="text-xs font-black uppercase">
                Légèrement discutable
              </SelectItem>
              <SelectItem value="Prix fixe / Non discutable" className="text-xs font-black uppercase">
                Prix fixe / Non discutable
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder={t.whatsapp_number}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 pl-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 focus:border-[#4a90e2]/30 focus:ring-2 focus:ring-[#4a90e2]/8 outline-none transition-all text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full h-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 px-4 text-sm font-black uppercase">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder=" ville" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl max-h-60">
            {Object.keys(CITIES_WITH_QUARTERS).map((c: string) => (
              <SelectItem key={c} value={c} className="text-xs font-black uppercase">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={neighborhood} onValueChange={setNeighborhood} disabled={!city}>
          <SelectTrigger className="w-full h-12 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 px-4 text-sm font-black uppercase disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder=" quartier" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl max-h-60">
            {availableNeighborhoods.map((n: string) => (
              <SelectItem key={n} value={n} className="text-xs font-black uppercase">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <input
            placeholder={t.stock}
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 focus:border-[#4a90e2]/30 outline-none transition-all text-sm font-black text-center"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-muted-foreground pointer-events-none">
            {t.stock}
          </span>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 transition-all",
          isDragActive && "border-[#4a90e2]/40 bg-[#4a90e2]/5",
        )}
      >
        <EditorContent
          editor={editor}
          className="min-h-[120px] w-full px-4 py-3 prose dark:prose-invert max-w-none text-sm focus:outline-none"
        />
        <input {...getInputProps()} />
      </div>

      {!!attachments.length && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {attachments.map((attachment: any) => (
            <AttachmentStudio
              key={attachment.file.name}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.file.name)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 10}
          label={t.add_media}
        />

        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!isFormValid || isUploading}
          className="rounded-2xl px-6 font-black text-xs uppercase italic tracking-widest bg-[#6ab344] hover:bg-[#5a9a38] text-white shadow-lg shadow-[#6ab344]/20 transition-all h-11 active:scale-[0.97]"
        >
          <Sparkles className="size-3.5 mr-1.5" />
          {t.publish_product}
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
  const filterStyle = { filter: `brightness(${settings.brightness}%)` };

  useEffect(() => {
    if (isVideo && videoRef.current) {
      const v = videoRef.current;
      const handleTimeUpdate = () => {
        if (v.currentTime >= settings.videoEnd) v.currentTime = settings.videoStart;
      };
      v.addEventListener("timeupdate", handleTimeUpdate);
      return () => v.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [isVideo, settings.videoStart, settings.videoEnd]);

  return (
    <div className="flex flex-col gap-2">
      <div className={cn(
        "relative group rounded-2xl overflow-hidden border border-border/40 bg-black aspect-[3/4] shadow-sm transition-all",
        attachment.isUploading && "opacity-50",
      )}>
        {attachment.file.type.startsWith("image") ? (
          <img src={src} style={filterStyle} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <video
            ref={videoRef} src={src} style={filterStyle}
            className="w-full h-full object-cover"
            muted autoPlay loop
            onLoadedMetadata={(e) => {
              const d = Math.floor(e.currentTarget.duration);
              setDuration(d);
              setSettings((prev) => ({ ...prev, videoEnd: d }));
            }}
          />
        )}

        {settings.overlayText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
            <span className="bg-black/70 backdrop-blur-sm px-3 py-1 text-white font-black uppercase text-xs border-2 border-white tracking-wide italic">
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
            <Loader2 className="animate-spin text-[#4a90e2]" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-3 bg-[#f8faff] dark:bg-zinc-900 rounded-2xl space-y-3 border border-[#4a90e2]/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground">
              <Type size={10} /> Texte
            </div>
            <input
              type="text"
              placeholder="TEXTE..."
              value={settings.overlayText}
              onChange={(e) => setSettings({ ...settings, overlayText: e.target.value.toUpperCase() })}
              className="w-full bg-background border border-border/40 rounded-xl p-2 text-[10px] font-bold outline-none"
            />
          </div>

          {isVideo && (
            <div className="space-y-2 border-t border-border/40 pt-2">
              <div className="text-[9px] font-black uppercase text-[#4a90e2]">Decouper</div>
              <input type="range" min="0" max={duration} value={settings.videoStart}
                onChange={(e) => setSettings({ ...settings, videoStart: parseInt(e.target.value) })}
                className="w-full h-1 accent-[#4a90e2]"
              />
              <input type="range" min="1" max={duration} value={settings.videoEnd}
                onChange={(e) => setSettings({ ...settings, videoEnd: parseInt(e.target.value) })}
                className="w-full h-1 accent-[#4a90e2]"
              />
            </div>
          )}

          <div className="border-t border-border/40 pt-2 space-y-1">
            <span className="text-[9px] font-black uppercase text-muted-foreground">Luminosite</span>
            <input type="range" min="50" max="150" value={settings.brightness}
              onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
              className="w-full h-1 rounded-full accent-[#4a90e2]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddAttachmentsButton({ onFilesSelected, disabled, label }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 border border-transparent hover:border-[#4a90e2]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
      >
        <Camera className="size-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
          {label}
        </span>
      </button>
      <input
        type="file" accept="image/*,video/*" multiple
        ref={fileInputRef} className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
      />
    </>
  );
}