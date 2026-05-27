
export function getSellerBadge(saleCount: number) {
  if (saleCount >= 100) {
    return { label: "Elite", color: "bg-purple-600" };
  }
  if (saleCount >= 50) {
    return { label: "Expert", color: "bg-blue-600" };
  }
  if (saleCount >= 20) {
    return { label: "Fiable", color: "bg-emerald-500" };
  }
   if (saleCount >= 10) {
    return { label: "Fiable", color: "bg-zinc-500" };
  }
  if (saleCount < 10) {
    return { label: "Actif", color: "bg-amber-500" };
  }
  return null;
}