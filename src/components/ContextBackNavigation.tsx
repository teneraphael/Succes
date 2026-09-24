"use client";

import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

const ROUTES_WITH_OWN_BACK = ["/settings/security", "/settings/notifications", "/seller/settings"];

export default function ContextBackNavigation() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/video" ||
      pathname.endsWith("/photos") || ROUTES_WITH_OWN_BACK.includes(pathname)) return null;

  const fallback = pathname.startsWith("/settings") ? "/" :
    pathname.startsWith("/seller") ? "/seller/dashboard" : "/";

  return <div className="mb-3 px-2 pt-3 sm:px-0"><BackButton fallback={fallback} /></div>;
}
