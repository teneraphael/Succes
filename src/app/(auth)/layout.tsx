import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  if (session) {
    redirect("/");
  }

  // ✅ Layout transparent — chaque page gère son propre style
  return <>{children}</>;
}