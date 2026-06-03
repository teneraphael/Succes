import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  const src = avatarUrl || avatarPlaceholder;

  // ✅ Bypass le proxy Next.js pour les domaines externes lents
  const isExternal =
    typeof src === "string" &&
    (src.includes("lh3.googleusercontent.com") ||
      src.includes("ufs.sh") ||
      src.includes("utfs.io"));

  return (
    <Image
      src={src}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      unoptimized={isExternal}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}