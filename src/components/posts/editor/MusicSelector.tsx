"use client";

import { TRENDING_MUSIC } from "@/lib/sounds";
import { Music, Play, Pause, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

export default function MusicSelector({ onSelect, selectedUrl }: any) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null); // Pour afficher si un lien est mort
  const [activeTab, setActiveTab] = useState("Amapiano");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = ["Amapiano", "Afrobeats", "Drill", "Local"];

  const filteredSounds = useMemo(() => 
    TRENDING_MUSIC.filter(s => s.category === activeTab), 
    [activeTab]
  );

 const handlePreview = async (e: React.MouseEvent, sound: any) => {
  e.stopPropagation();
  if (!audioRef.current) return;

  if (playingId === sound.id) {
    audioRef.current.pause();
    setPlayingId(null);
    return;
  }

  try {
    setErrorId(null);
    setLoadingId(sound.id);
    
    // On nettoie tout avant de changer de morceau
    audioRef.current.pause();
    audioRef.current.removeAttribute('src'); // Très important pour vider l'erreur précédente
    audioRef.current.load();

    // On injecte la nouvelle URL
    audioRef.current.src = sound.url;
    
    // On lance la lecture
    await audioRef.current.play();
    setPlayingId(sound.id);
  } catch (error) {
    console.error("Erreur :", error);
    // On ne met l'erreur que si ce n'est pas une annulation manuelle
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      setErrorId(sound.id);
    }
    setPlayingId(null);
  } finally {
    setLoadingId(null);
  }
};

  return (
    <div className="space-y-4 py-4 bg-muted/10 rounded-3xl p-4 border border-white/5">
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <Music className="size-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic text-foreground">Studio Audio</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                audioRef.current?.pause();
                setPlayingId(null);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border shrink-0",
                activeTab === cat 
                  ? "bg-foreground text-background border-foreground shadow-lg shadow-black/20" 
                  : "bg-transparent text-muted-foreground border-white/10 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* L'élément audio caché */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)} 
        preload="auto" 
      />

      {/* LISTE DES SONS */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filteredSounds.map((sound) => (
          <div 
            key={sound.id}
            onClick={() => {
               if (errorId === sound.id) return;
               onSelect(selectedUrl === sound.url ? null : { url: sound.url, title: sound.title });
            }}
            className={cn(
              "flex-shrink-0 w-36 p-4 rounded-[2rem] border-2 transition-all cursor-pointer relative",
              selectedUrl === sound.url 
                ? "border-orange-500 bg-orange-500/5" 
                : "border-transparent bg-secondary/40 hover:bg-secondary/60",
              errorId === sound.id && "opacity-50 cursor-not-allowed border-red-500/50"
            )}
          >
            <div className="flex justify-between items-start mb-4">
               <button 
                onClick={(e) => handlePreview(e, sound)}
                className={cn(
                    "size-9 rounded-2xl flex items-center justify-center transition-all shadow-md",
                    playingId === sound.id ? "bg-foreground text-background" : "bg-orange-500 text-white",
                    errorId === sound.id && "bg-red-500"
                )}
               >
                 {loadingId === sound.id ? (
                   <Loader2 size={16} className="animate-spin" />
                 ) : errorId === sound.id ? (
                   <AlertCircle size={16} />
                 ) : playingId === sound.id ? (
                   <Pause size={16} fill="currentColor" />
                 ) : (
                   <Play size={16} fill="currentColor" className="ml-0.5" />
                 )}
               </button>
               
               {selectedUrl === sound.url && (
                 <div className="bg-orange-500 rounded-full p-0.5 shadow-sm animate-in zoom-in">
                    <CheckCircle2 className="size-4 text-white" />
                 </div>
               )}
            </div>

            <div className="space-y-0.5">
                <p className="text-[11px] font-black truncate uppercase tracking-tighter">
                   {errorId === sound.id ? "Lien invalide" : sound.title}
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">{sound.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}