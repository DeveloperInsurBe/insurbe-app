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

  const isPartnerRoute =
    pathname.startsWith("/partner");

  return (
    <>
      {!isPartnerRoute && <Header />}

      {children}

      <Footernew />
    </>
  );
}