/** Comptes autorisés à créer des vendeurs depuis la conciergerie DealCity. */
const SELLER_CREATOR_IDS = new Set([
  "dgd2ohqrx3tqezng",
  "3mi4ihdjlono3kmx",
  "gyesvcknuipc5z2a",
]);

export function canCreateSeller(userId: string | null | undefined): boolean {
  return !!userId && SELLER_CREATOR_IDS.has(userId);
}
