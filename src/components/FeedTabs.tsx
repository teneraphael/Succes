"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedTabsProps {
  userId?: string;
  forYouFeed: React.ReactNode;
  followingFeed: React.ReactNode;
}

export default function FeedTabs({ userId, forYouFeed, followingFeed }: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState("for-you");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* CORRECTION :
        1. sticky : rend l'élément collant.
        2. top-[5.25rem] : C'est la valeur cruciale. 
           Si ta navbar fait 84px (5.25rem), alors tes onglets se colleront 
           juste en dessous d'elle dès que tu scrolles.
        3. z-40 : pour s'assurer qu'il passe au-dessus des posts.
        4. bg-background/95 : obligatoire pour que le contenu derrière soit masqué.
      */}
      <div className="sticky top-[5.25rem] z-40 w-full bg-background/95 bg-background py-2.5 shadow-sm">
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

      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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