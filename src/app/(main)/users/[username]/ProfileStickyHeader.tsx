"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import ZoomableImage from "@/components/ZoomableImage";

interface Props {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  isAdmin: boolean;

  
}

export default function ProfileStickyHeader({
  displayName,
  username,
  avatarUrl,
  isAdmin,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 260);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-[4rem] z-50 w-full">
            <div className="bg-card/95 backdrop-blur-md border-b border-border/40 px-4 py-2.5 flex items-center gap-3">
              <div className="p-[2px] rounded-full bg-gradient-to-br from-[#4a90e2] to-[#6ab344]">
                <div className="p-0.5 bg-card rounded-full">
                  <ZoomableImage
                    src={avatarUrl || "/icons/icon-192.png"}
                    alt="Avatar"
                    size={36}
                    className="size-8 rounded-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black truncate">
                    {displayName}
                  </p>

                  {isAdmin && (
                    <CheckCircle2 className="size-3.5 text-[#4a90e2]" />
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground">
                  @{username}
                </p>
              </div>
            </div>
          

          {/* espace sidebar droite */}
          <div className="hidden lg:block w-[320px]" />
        </div>
      
    
  );
} 