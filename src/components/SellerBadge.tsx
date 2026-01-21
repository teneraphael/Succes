import { BadgeCheck } from "lucide-react"; // Utilise BadgeCheck pour un meilleur rendu
import { cn } from "@/lib/utils";

interface SellerBadgeProps {
  followerCount: number;
  isSeller: boolean;
  className?: string;
}

export default function SellerBadge({ followerCount, isSeller, className }: SellerBadgeProps) {
  if (!isSeller) return null;

  const getBadgeConfig = (count: number) => {
    if (count >= 2000) return { color: "text-yellow-400", label: "Or" };
    if (count >= 500) return { color: "text-slate-300", label: "Argent" };
    if (count >= 100) return { color: "text-amber-600", label: "Bronze" };
    return { color: "text-blue-500", label: "Bleu" }; 
  };

  const config = getBadgeConfig(followerCount);

  return (
    <span 
      title={`Vendeur ${config.label} (${followerCount} abonnés)`} 
      className="inline-flex items-center select-none ml-1"
    >
      <BadgeCheck 
        // size-3.5 rend le badge plus petit et discret (environ 14px)
        // strokeWidth={2} évite que le V ne soit trop "gras" dans un petit cercle
        strokeWidth={2} 
        className={cn(
          "size-3.5 fill-current", 
          config.color, 
          "text-white", // La coche V en blanc
          className
        )} 
      />
    </span>
  );
}