import { validateRequest } from "@/auth";
import MenuBarClient from "./MenuBarClient";

interface MenuBarProps {
  className?: string;
}

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