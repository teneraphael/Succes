"use client";

import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | typeof avatarPlaceholder>(
    avatarUrl || avatarPlaceholder,
  );

  const isExternal =
    typeof imgSrc === "string" &&
    (imgSrc.includes("lh3.googleusercontent.com") ||
      imgSrc.includes("ufs.sh") ||
      imgSrc.includes("utfs.io"));

  return (
    <Image
      src={imgSrc}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      unoptimized={isExternal}
      // ✅ Si l'image échoue à charger → fallback sur le placeholder local
      onError={() => setImgSrc(avatarPlaceholder)}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}