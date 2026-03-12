// lib/audio-state.ts (ou dans un coin de ton fichier)
let globalMuted = true; 
const listeners = new Set<(muted: boolean) => void>();

export const audioStore = {
  isMuted: () => globalMuted,
  setMuted: (muted: boolean) => {
    globalMuted = muted;
    listeners.forEach(l => l(muted));
  },
  subscribe: (listener: (muted: boolean) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};