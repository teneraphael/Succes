"use client";

import { TRENDING_MUSIC } from "@/lib/sounds";
import { Music, Play, Pause, CheckCircle2, Loader2, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function MusicSelector({ onSelect, selectedUrl }: any) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  
  // ICI : On ajoute toutes les catégories pour qu'elles soient visibles
  const [activeTab, setActiveTab] = useState("Motivation");
  const categories = ["Motivation", "Lifestyle", "Trust", "Amapiano", "Afrobeats", "Drill", "Local"];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredSounds = useMemo(() => 
    TRENDING_MUSIC.filter(s => s.category === activeTab), 
    [activeTab]
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handlePreview = async (e: React.MouseEvent, sound: any) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playingId === sound.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    try {
      setLoadingId(sound.id);
      audioRef.current.pause();
      audioRef.current.src = sound.url;
      await audioRef.current.play();
      setPlayingId(sound.id);
    } catch (error) {
      setPlayingId(null);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 py-4 bg-muted/10 rounded-[2.5rem] p-6 border border-white/5">
      
      {/* HEADER AVEC VOLUME */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-xl">
              <Music className="size-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic text-foreground/80">
              Prospection Audio
            </span>
          </div>

          <div className="flex items-center gap-3 bg-secondary/30 px-3 py-1.5 rounded-2xl border border-white/5">
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} className="text-orange-500" />}
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        {/* ONGLETS DES CATÉGORIES (Scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                audioRef.current?.pause();
                setPlayingId(null);
              }}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all border shrink-0",
                activeTab === cat 
                  ? "bg-foreground text-background border-foreground shadow-lg" 
                  : "bg-transparent text-muted-foreground border-white/10 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* LISTE DES SONS FILTRÉS */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {filteredSounds.length > 0 ? (
          filteredSounds.map((sound) => (
            <div 
              key={sound.id}
              onClick={() => onSelect({ url: sound.url, title: sound.title })}
              className={cn(
                "flex-shrink-0 w-36 p-4 rounded-[2.2rem] border-2 transition-all cursor-pointer",
                selectedUrl === sound.url ? "border-orange-500 bg-orange-500/5" : "border-transparent bg-secondary/40"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                 <button 
                  onClick={(e) => handlePreview(e, sound)}
                  className={cn(
                      "size-10 rounded-2xl flex items-center justify-center shadow-md",
                      playingId === sound.id ? "bg-foreground text-background" : "bg-orange-500 text-white"
                  )}
                 >
                   {loadingId === sound.id ? <Loader2 size={18} className="animate-spin" /> : 
                    playingId === sound.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                 </button>
                 {selectedUrl === sound.url && <CheckCircle2 className="size-5 text-orange-500" />}
              </div>
              <p className="text-[11px] font-black truncate uppercase tracking-tighter">{sound.title}</p>
              <p className="text-[9px] font-bold text-muted-foreground opacity-70">{sound.duration}</p>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-muted-foreground px-4 italic">Aucun son dans cette catégorie...</p>
        )}
      </div>
    </div>
  );
}