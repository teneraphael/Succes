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
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black select-none"
        >
          {/* Logo officiel au centre */}
          <div className="relative size-32 mb-8">
            <Image
              src="/logo.png"
              alt="DealCity"
              fill
              sizes="128px"
              priority
              className="object-contain"
            />
          </div>

          {/* ✨ Concept 2 : Les Points de Capture (Shopping & Social) */}
          <div className="absolute bottom-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    y: [0, -7, 0], // Léger rebond vers le haut
                    opacity: [0.3, 1, 0.3], // Pulsation lumineuse synchronisée
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: index * 0.15, // Effet de cascade/vague
                    ease: "easeInOut",
                  }}
                  className="size-2.5 rounded-full bg-primary" // bg-primary prendra automatiquement la couleur de ton thème DealCity
                />
              ))}
            </div>
            
            <p className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-zinc-600">
              DealCity en direct
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}