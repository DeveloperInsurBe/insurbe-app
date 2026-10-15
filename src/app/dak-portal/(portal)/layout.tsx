import type { Metadata } from "next";
import type { ReactNode } from "react";

import PortalShell from "../_components/PortalShell";

export const metadata: Metadata = {
  title: "DAK Provider Portal | InsurBe",
  robots: { index: false, follow: false },
};

export default function DakPortalLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
