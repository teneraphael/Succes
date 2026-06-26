"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import FollowButton from "@/components/FollowButton";
import ShareProfileButton from "./ShareProfileButton";
import EditProfileButton from "./EditProfileButton";
import { FollowerInfo } from "@/lib/types";

interface StickyHeaderProps {
  user: any;
  loggedInUserId: string;
  followerInfo: FollowerInfo;
  isAdmin: boolean;
}

export default function UserProfileStickyHeader({
  user, loggedInUserId, followerInfo, isAdmin,
}: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  // ✅ Apparaît quand on a scrollé plus de 200px
  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`
      sticky top-[3.5rem] z-30 w-full
      bg-card/90 backdrop-blur-md border-b border-border/40
      px-4 sm:px-6 py-2.5
      flex items-center justify-between gap-3
      transition-all duration-300
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
    `}>
      {/* ✅ Avatar mini + nom */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-[2px] rounded-full bg-gradient-to-br from-[#4a90e2] to-[#6ab344] shrink-0">
          <div className="p-0.5 bg-card rounded-full">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={34}
              className="size-8 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-black text-foreground truncate leading-none">
              {user.displayName}
            </p>
            {isAdmin && (
              <CheckCircle2 className="size-3.5 text-[#4a90e2] fill-[#4a90e2]/15 stroke-[2.5] shrink-0" />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-bold">
            @{user.username}
          </p>
        </div>
      </div>

      {/* ✅ Boutons */}
      <div className="flex items-center gap-2 shrink-0">
        {loggedInUserId && user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          loggedInUserId && (
            <FollowButton userId={user.id} initialState={followerInfo} />
          )
        )}
        <ShareProfileButton username={user.username} />
      </div>
    </div>
  );
}