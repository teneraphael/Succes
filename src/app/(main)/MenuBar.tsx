import { validateRequest } from "@/auth";
import MenuBarClient from "./MenuBarClient";

interface MenuBarProps {
  className?: string;
}

// ✅ Server Component — récupère la session et passe les données au composant client
export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  return (
    <MenuBarClient
      className={className}
      isSeller={user?.isSeller ?? false}
      isLoggedIn={!!user}
      username={user?.username}
    />
  );
}