"use client";

import { usePathname } from "next/navigation";

import Header from "./Header";
import Footernew from "./footernew";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const isPartnerAccessRoute =
    pathname.startsWith("/partner-access");
  const isPartnerRoute =
    pathname.startsWith("/partner") && !isPartnerAccessRoute;
  const isAgentRoute =
    pathname.startsWith("/agent");
  const isPortalRoute =
    pathname.startsWith("/portal");

  return (
    <>
      {!isPartnerRoute &&
        !isAgentRoute &&
        !isPortalRoute && <Header />}

      {children}

      {!isAgentRoute && !isPortalRoute && <Footernew />}
    </>
  );
}
