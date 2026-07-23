// ✅ Étoiles basées sur le nombre de followers (abonnés)
export function getSellerStars(followerCount: number): number {
  if (followerCount >= 500) return 5;
  if (followerCount >= 200) return 4;
  if (followerCount >= 100) return 3;
  if (followerCount >= 50) return 2;
  return 1; // ✅ Tout nouveau vendeur commence à 1 étoile
}