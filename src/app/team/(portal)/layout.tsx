import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentTeamAdmin } from "@/lib/team/access";
import TeamNav from "./TeamNav";

export const metadata: Metadata = {
  title: "InsurBe Team Portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeamPortalLayout({ children }: { children: ReactNode }) {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <TeamNav name={teamAdmin.name} email={teamAdmin.email} />
      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
