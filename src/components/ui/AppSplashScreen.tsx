"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AppSplashScreenProps {
  isLoading: boolean;
}

export default function AppSplashScreen({ isLoading }: AppSplashScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          // 🔥 CRUCIAL : Pas d'animation d'entrée (initial) pour ne pas casser la transition 
          // fluide avec le Splash Screen fixe affiché par le système du smartphone (PWA).
          exit={{ 
            opacity: 0,
            transition: { duration: 0.25, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black select-none"
        >
          {/* 🎯 Logo PWA : On utilise l'icône exacte configurée dans ton manifest pour éviter le décalage */}
          <div className="relative size-24 md:size-32">
            <Image
              src="/icons/icon-512.png" 
              alt="DealCity"
              fill
              sizes="(max-width: 768px) 96px, 128px"
              priority
              className="object-contain"
            />
          </div>

          {/* ✨ Concept 2 : Les 3 Points de Capture (Shopping & Social) animés en bas */}
          <div className="absolute bottom-20 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    y: [0, -6, 0],         // Rebond fluide vers le haut
                    opacity: [0.3, 1, 0.3], // Pulsation lumineuse en cascade
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: index * 0.12,   // Effet de vague parfait entre les points
                    ease: "easeInOut",
                  }}
                  className="size-2 rounded-full bg-primary" // S'illumine avec la couleur principale de DealCity
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}