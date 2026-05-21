"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedTabsProps {
  userId?: string;
  forYouFeed: React.ReactNode;
  followingFeed: React.ReactNode;
}

export default function FeedTabs({ userId, forYouFeed, followingFeed }: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState("for-you");

  // Fonction pour gérer le swipe
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // On définit un seuil de 50px pour le swipe
    if (info.offset.x > 50) setActiveTab("for-you");
    else if (info.offset.x < -50) setActiveTab("following");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="sticky top-[5.25rem] z-40 w-full  py-2.5 shadow-sm">
        <TabsList className="bg-muted/75 border border-border/20 p-1 h-11 max-w-[280px] sm:max-w-xs mx-auto flex rounded-full select-none">
          <TabsTrigger 
            value="for-you" 
            className="flex-1 rounded-full text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            Pour vous
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="flex-1 rounded-full text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
          >
            Abonnements
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "following" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "following" ? -50 : 50 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            
            /* Réactivation du swipe sans bloquer le scroll vertical */
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <TabsContent value="for-you" className="mt-4 outline-none border-none">
              {forYouFeed}
            </TabsContent>
            <TabsContent value="following" className="mt-4 outline-none border-none">
              {followingFeed}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs>
  );
}