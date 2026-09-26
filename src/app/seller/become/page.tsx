import { redirect } from "next/navigation";

// Conserve les anciens liens vers le formulaire vendeur gratuit.
export default function SellerBecomeRedirect() {
  redirect("/become-seller");
}
