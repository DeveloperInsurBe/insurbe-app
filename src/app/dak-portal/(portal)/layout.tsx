import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentDakReviewer } from "@/lib/dak/access";
import PortalShell from "../_components/PortalShell";

export const metadata: Metadata = {
  title: "DAK Provider Portal | InsurBe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DakPortalLayout({ children }: { children: ReactNode }) {
  const reviewer = await getCurrentDakReviewer();
  if (!reviewer) redirect("/dak-portal/login");

  const { name, email, firstName, lastName } = reviewer;
  return <PortalShell reviewer={{ name, email, firstName, lastName }}>{children}</PortalShell>;
}
